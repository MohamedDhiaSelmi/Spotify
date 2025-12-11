const yup = require('yup')
const validatePlan =async (req,res,next)=>{
    try{
        const schema=yup.object().shape({
            nom_plan:yup.string().required('Le nom du plan est requis'),
            objectif:yup.string().required('L’objectif est requis'),
            duree:yup
            .number()
            .required('La durée est requise')
            .positive('La durée doit être positive')
            .integer('La durée doit être un nombre entier')
        });
        await schema.validate(req.body)
        next();


    }catch(err){
        res.status(404).json(err)
    }

};
module.exports=validatePlan;