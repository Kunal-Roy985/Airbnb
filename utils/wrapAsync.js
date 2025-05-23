const ExpressError = require("./ExpressError")

module.exports = (fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next)
    }
}