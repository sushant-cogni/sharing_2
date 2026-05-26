import fs from "fs";

export const printlogs = (req, res, next) => {
    try {
        const log = `\n${new Date().getHours()}:${new Date().getMinutes()} |\t${new Date().toDateString()} \t|\t${req.method}  |\t${req.url}`;

        fs.appendFile("./utils/logs.txt", log, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Logs Printed");
            }
            next();
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};
