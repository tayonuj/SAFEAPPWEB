import { defineStore } from "pinia";

export const useDatasetStore = defineStore("datasetStore", {
    state: () => ({
        dataset: null,  // Stores any dataset
    }),
    actions: {
        setDataset(data) {
            this.dataset = data;
        },
        clearDataset() {
            this.dataset = null;
        },
    },
    persist: {
        enabled: true, // Enables persistence
        storage: localStorage, // Use localStorage to persist data
    },
});
