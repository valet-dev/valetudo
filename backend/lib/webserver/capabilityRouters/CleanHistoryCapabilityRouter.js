const CapabilityRouter = require("./CapabilityRouter");

class CleanHistoryCapabilityRouter extends CapabilityRouter {
    initRoutes() {
        this.router.get("/records-with-data", this.validator, async (req, res) => {
            try {
                const after = typeof req.query.after === "string" ? req.query.after : undefined;
                const limit = {
                    number: (/** @type {number} */ limit) => limit,
                    string: (/** @type {string} */ limit) => parseInt(limit, 10)
                }[req.query.limit]?.(req.query.limit);

                res.json(await this.capability.getHistoryRecordsWithData(after, limit));
            } catch (e) {
                this.sendErrorResponse(req, res, e);
            }
        });
    }
}

module.exports = CleanHistoryCapabilityRouter;
