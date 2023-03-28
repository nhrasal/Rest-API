export default (context: any): string[] => {
  let message: string;
  let error: string; 

  if (context.code == "23505") {
    message = "Property Must Be Unique!";
    error = context.detail;
  } else if (context.code == "22P02") {
    message = "Invalid uuid !";
    error = context.message;
  } else if (context.code == "23503") {
    message = "Wrong Foreign Key";
    error = context.detail;
  } else if (context.code == "23502") {
    message = "Property must not be NULL";
    error = context.detail;
  } else {
    message = "Operation Failed!";
    error = context;
  }

  return [message, error];
};
