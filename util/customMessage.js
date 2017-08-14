
let ErrorMessage = function (code, message) {
    this.code = code;
    this.message = message;
    this.type = "Error";
}

ErrorMessage.prototype = Error.prototype;

let Message = function(code, data, message){
  this.code = code;
  this.message = message;
  this.data = data;
  this.type = "Info";
}

ErrorMessage.USERNAME_ALREADY_EXIST = "username_already_exist";
ErrorMessage.OBJECT_NOT_FOUND = "object_not_found";
ErrorMessage.DATABASE_ERROR = "database_error";
ErrorMessage.VALIDATION_ERROR = "validation_error";
ErrorMessage.MISSING_PARAMETER = "missing_parameter";
ErrorMessage.AUTHENTICATION_ERROR = "Authentication_error";
ErrorMessage.EMAIL_ERROR = "email_error";
ErrorMessage.UNAUTHORIZATION_ERROR = "unauthorization_error";
ErrorMessage.ALREADY_CREATED = "object_already_created";
ErrorMessage.UNSUPPORTED_OPERATION = "unsupported_operation";

Message.USER_CREATED = "user_is_created";
Message.GETTING_DATA = "Getting_data";
Message.OBJECT_CREATED = "Object_created";
Message.OBJECT_REMOVED = "Object_removed";
Message.UPDATE_OBJECT = "Object_updated";
Message.EMAIL_SENT = "email_sent";
Message.RESET_PASSWORD = "reset_password";
Message.NOT_SUPPORTED_QUERY = "not_supported_query";
module.exports.ErrorMessage = ErrorMessage;
module.exports.Message = Message;
