import {ref, computed, watch, inject, onMounted} from "vue";
import moment from "moment";
import {
    getDateRangeArray,
    getDateRangeArrayExcludingWeekendsAndHolidays,
    convertToUTCDateTime,
} from "../../timeconversion";
import generalAxiosRequest from "../../generalAxiosRequest";
import notificationHandling from "../../notificationHandling";
import {findLocalStorage} from "../../../storage/LocalStorageHandler";

export const useLeaveForm = (props) => {
    const fromDate = ref(new Date());
    const toDate = ref(new Date());
    const selectedLeaveType = ref(1);
    const leaveReason = ref(null);
    const comments = ref(null);
    const coveringEmp = ref(null);
    const coveringEMPProfile = ref(null);
    const coveringEMPLoading = ref(false);
    const additionalData = ref(null);

    const dateRange = ref([]);
    const leaveTypes = ref([]);
    const halfTypes = ref([]);
    const holidays = ref([]);
    const calanderMarkers = ref([]);
    const btnSubmitDisabled = ref(false);

    const leaveReasons = [
        "Personal Reason",
        "Illness",
        "Injury",
        "Religious Festival",
        "Medical Appointment",
        "Bereavement",
        "Family Health Problem",
        "Elections (General)",
        "Conference",
        "Training",
        "Natural Disaster",
        "Special Leave",
        "Sit for an Exam",
    ];

    const leave_left_count = ref(0);
    const selected_remaining_count = ref(0);
    const totalLeaveDays = computed(() =>
        leaveTypes.value.reduce(
            (total, type) => total + (type === "fullday" ? 1 : 0.5),
            0
        )
    );

    const baseurl = inject("$baseURL");
    const $loading = inject("$loading");

    watch(totalLeaveDays, () => calculateAvailability());

// Watch changes to fromDate and toDate
    watch(fromDate, () => {
        if (fromDate.value > toDate.value) {
            toDate.value = fromDate.value;
        }
        validateDateRange();
    });

    watch(toDate, () => {
        validateDateRange();
    });

    watch(leave_left_count, (data) => {
        if (data<0){
            btnSubmitDisabled.value = true;
        }else{
            btnSubmitDisabled.value = false;
        }
    });

    const handleFromDateUpdate = (value) => {
        fromDate.value = value;
    };

    const handleToDateUpdate = (value) => {
        toDate.value = value;
    };
    const validateDateRange = () => {

        const maxLength = selectedLeaveType.value === 0 ? 2 : 7;

        let fullDateRange = [];
            // if(user?.GP_NAME === "Normal staff"){
            if(props.user?.LG_CODE === 1){
                fullDateRange =getDateRangeArrayExcludingWeekendsAndHolidays(fromDate.value, toDate.value, holidays.value);
                console.log("date range dataset normal staff",fullDateRange)
            }else{
                fullDateRange = getDateRangeArray(fromDate.value, toDate.value);
                console.log("date range dataset",fullDateRange)
            }

        if (fullDateRange.length > maxLength) {
            toDate.value = fullDateRange[maxLength - 1];
            dateRange.value = fullDateRange.slice(0, maxLength);

            notificationHandling(
                "error",
                `The date range has been adjusted to comply with the maximum allowed ${maxLength} days.`
            );
        } else {
            dateRange.value = fullDateRange;
        }

        leaveTypes.value = Array(dateRange.value.length).fill("fullday");
    };
    const calculateAvailability = () => {
        let availability = _.find(props.tblLeaveStatData, {lev_type_code: selectedLeaveType.value});
        console.log("availability", props.tblLeaveStatData);
        console.log("availability total leave days", totalLeaveDays.value);
        if (availability){
            leave_left_count.value = availability.remaining_days - totalLeaveDays.value;
            selected_remaining_count.value = availability.remaining_days;
        }
    };



    const setCalendarMarkers = (holidaysData) => {
        holidays.value = holidaysData.map((holiday) => holiday.Date);

        calanderMarkers.value = holidaysData.map((holiday) => {
            const isPoyaday = holiday.Holiday.includes('Poya');
            return {
                date: new Date(holiday.Date),
                type: 'dot',
                color: isPoyaday ? 'red' : 'green',
                tooltip: [{ text: holiday.Holiday, color: isPoyaday ? 'yellow' : 'green' }],
            };
        });
        validateDateRange();
    };


    const validateLeaveDates = async (dateRange, leaveHistory, leaveHalfTypes) => {
        const errors = [];

        // Loop through the selected date range
        dateRange.forEach((date, index) => {
            const selectedLeaveType = leaveTypes.value[index]; // 'fullday' or 'halfday'
            const selectedHalf = leaveHalfTypes.value[index]; // 1 (1st half) or 2 (2nd half)

            leaveHistory.forEach((leave) => {
                if (leave.LEAVE_DETAILS) {
                    // Initialize counters to track halfday occurrences
                    let firstHalfTaken = false;
                    let secondHalfTaken = false;

                    leave.LEAVE_DETAILS.forEach((detail) => {
                        if (
                            detail.date === date && // Date matches
                            leave.STATUS !== "Rejected" &&
                            leave.STATUS !== "Cancelled" &&
                            leave.STATUS !== "Cancel_Approved"
                        ) {
                            // Full day leave blocks any new leave
                            if (detail.type === "fullday") {
                                errors.push(`Leave conflict: ${date} is already taken as a full day.`);
                            }

                            // Track halfday occurrences
                            if (detail.type === "halfday") {
                                if (detail.half === 1) {
                                    firstHalfTaken = true;
                                }
                                if (detail.half === 2) {
                                    secondHalfTaken = true;
                                }
                            }
                        }
                    });

                    // Prevent full day if any halfday is already taken
                    if (
                        selectedLeaveType === "fullday" &&
                        (firstHalfTaken || secondHalfTaken)
                    ) {
                        errors.push(
                            `Leave conflict: ${date} has an existing half day leave. Full day leave is not allowed.`
                        );
                    }

                    // Prevent halfday if the same half is already taken
                    if (selectedLeaveType === "halfday") {
                        if ((selectedHalf === 1 && firstHalfTaken) || (selectedHalf === 2 && secondHalfTaken)) {
                            errors.push(
                                `Leave conflict: ${date} - ${selectedHalf === 1 ? "1st half" : "2nd half"} is already taken.`
                            );
                        }
                    }
                }
            });
        });

        return errors;
    };

    const setCoveringEmployee = (emp_no) => {
        // alert(JSON.stringify(employee))
        coveringEmp.value = emp_no;
    }

    watch(() => props.user, (data, oldEvent) => {
        if (data) {
            validateDateRange()
        }
    });

    watch(() => props.tblLeaveStatData, (data, oldEvent) => {
        if (data){
            calculateAvailability();
        }
    },{immediate:true})


    watch(() => props.holidays, (data, oldEvent) => {
            if (data && data.length>0){
                setCalendarMarkers(data)
            }
    },{immediate:true});
    return {
        fromDate,
        toDate,
        selectedLeaveType,
        leaveReason,
        comments,
        coveringEmp,
        coveringEMPProfile,
        coveringEMPLoading,
        additionalData,
        leaveTypes,
        halfTypes,
        dateRange,
        totalLeaveDays,
        leave_left_count,
        selected_remaining_count,
        calanderMarkers,
        leaveReasons,
        btnSubmitDisabled,
        validateDateRange,
        calculateAvailability,
        handleFromDateUpdate,
        handleToDateUpdate,
        setCalendarMarkers,
        validateLeaveDates,
        setCoveringEmployee
    };
};
