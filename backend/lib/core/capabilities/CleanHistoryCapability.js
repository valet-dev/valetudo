const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");
const ValetudoDataPoint = require("../../entities/core/ValetudoDataPoint");
/**
 * must be serialized/deserialized into string for each robot to ensure compatibility
 * 
 * @typedef {string} CleanHistoryJobId
 */

/**
 * History Cleaning
 * known status:
 * 0 -> unfinished
 * 1 -> completed
 * 
 * @typedef {number} CleanHistoryJobStatus
 */

/**
 * @typedef {{
 *   id: CleanHistoryJobId,
 *   status: CleanHistoryJobStatus,
 *   startTime: number,
 *   endTime: number,
 *   statistics: Array<ValetudoDataPoint>
 *   error?: import("../../entities/core/ValetudoRobotError")
 * }} CleanHistoryJob
 */

/**
 * @template {import("../ValetudoRobot")} T
 * @extends Capability<T>
 */
class CleanHistoryCapability extends Capability {
    /**
     * Cleaning history
     * 
     * @type {(after?: CleanHistoryJobId, limit?: number) => Promise<{records: Array<CleanHistoryJob>, remaining: number}>}
     */
    async getHistoryRecordsWithData() {
        throw new NotImplementedError();
    }

    getType() {
        return CleanHistoryCapability.TYPE;
    }

    /**
     * @return {{availableStatistics: Array<ValetudoDataPoint.TYPES>}}
     */
    getProperties() {
        return {
            availableStatistics: []
        };
    }
}

CleanHistoryCapability.TYPE = "CleanHistoryCapability";

module.exports = CleanHistoryCapability;
