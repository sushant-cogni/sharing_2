
export default class DBConnectionError extends Error{

    constructor(message){
        super(message);
        this.type = "DBConnectionError";
        this.isOperational=true;
        this.statusCode=400
    }
}