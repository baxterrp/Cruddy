module.exports = {
    IsValid : function(value){
        return value != undefined 
            && value != null
            && value != "";
    }
}