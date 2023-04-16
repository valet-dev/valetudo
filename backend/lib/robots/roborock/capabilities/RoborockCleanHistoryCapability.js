const CleanHistoryCapability = require("../../../core/capabilities/CleanHistoryCapability");
const ValetudoDataPoint = require("../../../entities/core/ValetudoDataPoint");

/**
 * @extends CleanHistoryCapability<import("../RoborockValetudoRobot")>
 */
class RoborockCleanHistoryCapability extends CleanHistoryCapability {
    /**
     * @protected 
     * @type {() => Promise<Array<number>>} */
    async getAllHistoryRecordIds() {
        const res = await this.robot.sendCommand("get_clean_summary", [], {});

        // This is how roborock robots before the S7 reported total statistics
        if (Array.isArray(res) && res.length === 4) {
            const records = Array.isArray(res[3]) ? res[3] : [];
            if (records.every(record => typeof record === "number")) {
                return records;
            }
        }

        //S7 and up
        if (Array.isArray(res?.records)) {
            if (res.records.every(record => typeof record === "number")) {
                return res.records;
            }
        }

        throw new Error("Received invalid response");
    }

    /**
     * @protected 
     * @type {(recordId: number) => Promise<import("../../../core/capabilities/CleanHistoryCapability").CleanHistoryJob>} */
    async getHistoryRecordData(recordId) {
        const res = await this.robot.sendCommand("get_clean_record", [recordId], {});

        if (Array.isArray(res) || Array.isArray(res[0])) {
            if (res[0].length >= 6 && res[0].every(field => typeof field === "number")) {
                const data = /** @type {number[]} */ (res[0]);
                const timestamp = new Date(data[1] * 1000);
                return {
                    id: `${recordId}`,
                    startTime: data[0] * 1000,
                    endTime: data[1] * 1000,
                    statistics: [
                        new ValetudoDataPoint({
                            timestamp,
                            type: ValetudoDataPoint.TYPES.TIME,
                            value: Math.floor(data[2])
                        }),
                        new ValetudoDataPoint({
                            timestamp,
                            type: ValetudoDataPoint.TYPES.AREA,
                            value: data[3] / 1000000
                        }),
                    ],
                    error: this.robot.mapErrorCode(data[4]),
                    status: data[5]
                };
            }
        }

        throw new Error("Received invalid response");
    }

    /**
     * @public
     * @param {string} [after]
     * @param {number} [limit]
     */
    async getHistoryRecordsWithData(after, limit) {
        const allRecords = await this.getAllHistoryRecordIds();
        let selectedRecords = allRecords;
        let remaining = allRecords.length;

        if (typeof after === "string") {
            const start = allRecords.indexOf(+after) + 1;
            selectedRecords = start ? selectedRecords.slice(start) : [];
        }

        if (typeof limit === "number") {
            selectedRecords = selectedRecords.slice(0, limit);
        }


        const tail = selectedRecords[selectedRecords.length -1];
        if (tail) {
            remaining = (allRecords.length - 1) - allRecords.indexOf(tail);
        } else if (limit === 0 && after && typeof after === "string"){
            remaining = (allRecords.length - 1) - allRecords.indexOf(+after);
        }

        const records = await Promise.all(selectedRecords.map(recordId => this.getHistoryRecordData(recordId)));

        return {records, remaining};
    }

    getProperties() {
        return {
            availableStatistics: [
                ValetudoDataPoint.TYPES.TIME,
                ValetudoDataPoint.TYPES.AREA
            ]
        };
    }
}

module.exports = RoborockCleanHistoryCapability;
