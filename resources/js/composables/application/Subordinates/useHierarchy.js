import { ref, inject } from "vue";
import generalAxiosRequest from "../generalAxiosRequest";
import notificationHandling from "../notificationHandling";

export function useHierarchy(baseURL, $loading, division, proxy) {
    const employees = ref([]);
    const superior = ref(null);
    const subordinates = ref([]);
    const draggedEmployee = ref(null); // Can now hold multiple employees
    const finalHierarchy = ref([]);
    const reportingData = ref([]);

    const fetchEmployees = async () => {
        const loadingInstance = $loading.show();
        try {
            const payload = {
                url: baseURL + "/api/v1/admin/employee/get",
                data: JSON.stringify({
                    attr: "currentwork.HIE_NAME_3",
                    filter_array: JSON.stringify([division]),
                }),
            };
            const { json_data } = await generalAxiosRequest(
                "curl-requests/post",
                payload,
                false
            );

            if (json_data.value && json_data.value.length > 0) {
                let active_employees = _.filter(json_data.value,{'ACTIVE_HRM_FLG':1});
                // let inactive_employees = _.filter(json_data.value, o => parseInt(o.ACTIVE_HRM_FLG) !== 1);
                employees.value = _.concat(active_employees,[]);
                await fetchReportingData(employees.value.map((emp) => emp.EMP_NUMBER));
            }
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        } finally {
            loadingInstance.hide();
        }
    };

    const fetchReportingData = async (empNumbers) => {
        const payload = {
            url: baseURL + "/api/v1/general-queries/readData",
            data: JSON.stringify({
                collection: "reporting_structure",
                attr: "EREP_SUP_EMP_NUMBER",
                filter_array: JSON.stringify(empNumbers),
            }),
        };
        const { json_data } = await generalAxiosRequest(
            "curl-requests/post",
            payload,
            false
        );

        if (json_data.value && json_data.value.length > 0) {
            reportingData.value = json_data.value;
            console.log("Reporting data", reportingData.value);
        }
    };

    const updateFinalHierarchy = ({ action, superiorId, subordinateId }) => {
        let hierarchy = finalHierarchy.value.find(
            (entry) => entry.EREP_SUP_EMP_NUMBER === superiorId
        );

        switch (action) {
            case "add":
                if (hierarchy) {
                    if (!hierarchy.EREP_SUB_EMP_NUMBERS.includes(subordinateId)) {
                        hierarchy.EREP_SUB_EMP_NUMBERS.push(subordinateId);
                    }
                } else {
                    finalHierarchy.value.push({
                        EREP_SUP_EMP_NUMBER: superiorId,
                        EREP_SUB_EMP_NUMBERS: [subordinateId],
                    });
                }
                break;

            case "remove":
                if (hierarchy) {
                    hierarchy.EREP_SUB_EMP_NUMBERS = hierarchy.EREP_SUB_EMP_NUMBERS.filter(
                        (id) => id !== subordinateId
                    );

                    if (hierarchy.EREP_SUB_EMP_NUMBERS.length === 0) {
                        finalHierarchy.value = finalHierarchy.value.filter(
                            (entry) => entry.EREP_SUP_EMP_NUMBER !== superiorId
                        );
                    }
                }
                break;

            default:
                console.error("Unknown action:", action);
        }
    };

    const onCardDragStart = (employee) => {
        if (Array.isArray(employee)) {
            draggedEmployee.value = employee; // Handle multiple employees
        } else {
            draggedEmployee.value = [employee]; // Wrap single employee in array
        }
        console.log("Drag started", draggedEmployee.value);
    };

    const onCardDragStartFromSuperior = () => {
        if (superior.value) {
            draggedEmployee.value = [{ ...superior.value }]; // Wrap as an array
        }
    };

    const onCardDragStartFromSubordinates = (employeesToDrag) => {
        console.log("Selected subordinates to drag", employeesToDrag);
        if (Array.isArray(employeesToDrag)) {
            draggedEmployee.value = [...employeesToDrag]; // Use spread operator to clone the array
        } else if (employeesToDrag) {
            draggedEmployee.value = [{ ...employeesToDrag }];
        } else {
            draggedEmployee.value = [];
        }
    };

    const onMainListDrop = async () => {
        console.log("Dragged employees to main list", draggedEmployee.value);
        if (draggedEmployee.value && draggedEmployee.value.length > 0) {
            const rollbackList = []; // To track employees who should be rolled back

            for (const employee of draggedEmployee.value) {
                // Check if the employee is already a subordinate under the current superior
                if (
                    superior.value &&
                    reportingData.value.some(
                        (report) =>
                            report.EREP_SUP_EMP_NUMBER === superior.value.EMP_NUMBER &&
                            report.EREP_SUB_EMP_NUMBER === employee.EMP_NUMBER
                    )
                ) {
                    const confirmed = await proxy.$confirm({
                        title: "Remove Subordinate?",
                        message: `This will remove ${employee.FULLNAME} from ${superior.value.FULLNAME}. Continue?`,
                    });

                    if (confirmed) {
                        const record = reportingData.value.find(
                            (report) =>
                                report.EREP_SUP_EMP_NUMBER === superior.value.EMP_NUMBER &&
                                report.EREP_SUB_EMP_NUMBER === employee.EMP_NUMBER
                        );

                        if (record) {
                            const loadingInstance = $loading.show();
                            const payload = {
                                url: baseURL + "/api/v1/general-queries/deleteRecord",
                                data: JSON.stringify({
                                    collection: "reporting_structure",
                                    id: record._id,
                                }),
                            };
                            const { json_data } = await generalAxiosRequest(
                                "curl-requests/post",
                                payload,
                                false
                            );

                            if (json_data.value) {
                                notificationHandling("success", "Record deleted successfully!");
                            }
                            loadingInstance.hide();
                        }
                    } else {
                        rollbackList.push(employee); // Add to rollback list
                        continue; // Skip further processing for this employee
                    }
                }

                // Check if the dragged employee is the current superior
                if (superior.value && superior.value.EMP_NUMBER === employee.EMP_NUMBER) {
                    // Clear the superior and reset the hierarchy
                    superior.value = null;
                    finalHierarchy.value = finalHierarchy.value.filter(
                        (entry) => entry.EREP_SUP_EMP_NUMBER !== employee.EMP_NUMBER
                    );
                }

                // Add the employee to the main list if not already present
                if (!employees.value.some((e) => e.EMP_NUMBER === employee.EMP_NUMBER)) {
                    employees.value.unshift({ ...employee });
                }

                // Remove the employee from the subordinates list
                if (
                    subordinates.value.some((sub) => sub.EMP_NUMBER === employee.EMP_NUMBER)
                ) {
                    subordinates.value = subordinates.value.filter(
                        (sub) => sub.EMP_NUMBER !== employee.EMP_NUMBER
                    );

                    if (superior.value) {
                        updateFinalHierarchy({
                            action: "remove",
                            superiorId: superior.value.EMP_NUMBER,
                            subordinateId: employee.EMP_NUMBER,
                        });
                    }
                }
            }

            // Rollback employees who were not confirmed for removal
            rollbackList.forEach((employee) => {
                if (
                    !subordinates.value.some((sub) => sub.EMP_NUMBER === employee.EMP_NUMBER)
                ) {
                    subordinates.value.push(employee); // Add back to subordinates
                }

                // Remove from main list if accidentally added
                employees.value = employees.value.filter(
                    (e) => e.EMP_NUMBER !== employee.EMP_NUMBER
                );
            });

            // Reset dragged employees
            draggedEmployee.value = [];
        } else {
            console.warn("No employee(s) to drop.");
        }
    };
    const onSuperiorDrop = () => {
        if (draggedEmployee.value.length === 1) {
            const employee = draggedEmployee.value[0]; // Only one employee should be dragged as a superior
            const newSuperiorId = employee.EMP_NUMBER;

            // Handle existing superior
            if (superior.value) {
                const oldSuperior = { ...superior.value }; // Copy the old superior
                if (!employees.value.some((e) => e.EMP_NUMBER === oldSuperior.EMP_NUMBER)) {
                    employees.value.push(oldSuperior); // Add the current superior back to the main list
                }
            }

            // Assign the new superior
            superior.value = employee;

            // Remove the new superior from the main list
            employees.value = employees.value.filter(
                (e) => e.EMP_NUMBER !== newSuperiorId
            );

            // Clear existing hierarchy for the new superior
            finalHierarchy.value = finalHierarchy.value.filter(
                (entry) => entry.EREP_SUP_EMP_NUMBER !== newSuperiorId
            );

            // Add all current subordinates to the new superior in the hierarchy
            subordinates.value.forEach((subordinate) => {
                updateFinalHierarchy({
                    action: "add",
                    superiorId: newSuperiorId,
                    subordinateId: subordinate.EMP_NUMBER,
                });
            });

            // Handle any preexisting subordinates for the new superior
            const preexistingSubordinates = reportingData.value
                .filter((report) => report.EREP_SUP_EMP_NUMBER === newSuperiorId)
                .map((report) => report.EREP_SUB_EMP_NUMBER);

            preexistingSubordinates.forEach((subId) => {
                updateFinalHierarchy({
                    action: "add",
                    superiorId: newSuperiorId,
                    subordinateId: subId,
                });
            });

            // Reset dragged employees
            draggedEmployee.value = [];
        } else {
            notificationHandling(
                "error",
                "Only a single employee can be assigned as a superior."
            );
            console.error("Only a single employee can be assigned as a superior.");
        }
    };

    const onSubordinateDrop = () => {
        if (draggedEmployee.value.length > 0) {
            draggedEmployee.value.forEach((employee) => {
                // Check if the employee is not already in the subordinate list
                if (!subordinates.value.some((e) => e.EMP_NUMBER === employee.EMP_NUMBER)) {
                    subordinates.value.push(employee); // Add the employee to the subordinates list

                    // Update hierarchy if a superior exists
                    if (superior.value) {
                        updateFinalHierarchy({
                            action: "add",
                            superiorId: superior.value.EMP_NUMBER,
                            subordinateId: employee.EMP_NUMBER,
                        });
                    }

                    // Remove the employee from the main list
                    employees.value = employees.value.filter(
                        (e) => e.EMP_NUMBER !== employee.EMP_NUMBER
                    );
                }
            });

            // Reset dragged employees
            draggedEmployee.value = [];
        } else {
            console.warn("No employee(s) to drop.");
        }
    };

    const loadSubordinateFromSup = () => {
        if (!superior.value) {
            console.warn("No superior selected");
            return;
        }

        const superiorEmpNumber = superior.value.EMP_NUMBER;

        const subordinateEmpNumbers = reportingData.value
            .filter((report) => report.EREP_SUP_EMP_NUMBER === superiorEmpNumber)
            .map((report) => report.EREP_SUB_EMP_NUMBER);

        // if (subordinateEmpNumbers.length === 0) {
        //     // If no subordinates are found, clear the subordinates list
        //     subordinates.value = [];
        //     notificationHandling('info',"No subordinates found for the selected superior");
        //     return;
        // }
        const subordinatesToAdd = employees.value.filter((employee) =>
            subordinateEmpNumbers.includes(employee.EMP_NUMBER)
        );

        subordinatesToAdd.forEach((subordinate) => {
            if (!subordinates.value.some((e) => e.EMP_NUMBER === subordinate.EMP_NUMBER)) {
                subordinates.value.push(subordinate);
            }
        });

        employees.value = employees.value.filter(
            (employee) => !subordinateEmpNumbers.includes(employee.EMP_NUMBER)
        );
    };

    const clearAllSubordinates = () => {
        subordinates.value.forEach((subordinate) => {

            if (superior.value) {
                updateFinalHierarchy({
                    action: "remove",
                    superiorId: superior.value.EMP_NUMBER,
                    subordinateId: subordinate.EMP_NUMBER,
                });
            }

            if (!employees.value.some((e) => e.EMP_NUMBER === subordinate.EMP_NUMBER)) {
                employees.value.push(subordinate);
            }
        });

        subordinates.value = [];
    };

    return {
        employees,
        superior,
        subordinates,
        draggedEmployee,
        finalHierarchy,
        fetchEmployees,
        updateFinalHierarchy,
        onCardDragStart,
        onCardDragStartFromSubordinates,
        onCardDragStartFromSuperior,
        onMainListDrop,
        onSuperiorDrop,
        onSubordinateDrop,
        loadSubordinateFromSup,
        clearAllSubordinates,
    };
}
