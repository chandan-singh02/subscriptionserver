// export const catchAsyncError = () => {
//   return () => {}; //this catchasyncerorr function return a function
// };

//OR we can write

export const catchAsyncError = (passedFunction) => (req, res, next) => {
  Promise.resolve(passedFunction(req, res, next)).catch(next);
};
