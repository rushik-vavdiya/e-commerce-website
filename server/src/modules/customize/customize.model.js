import mongoose from 'mongoose';

const customizeSchema = new mongoose.Schema(
    {
        pageName: {
            type: String,
            required: true,
            
        },
        sectionName: {
            type: String,
            required: true,
        },
        sectionHeading: {
            type: String,
        },
        sectionBgImage: {
            type: String,
        },
        sectionContent:{
            type: String,
        },
        sectionContentImage: {
            type: String,
        },
        sectionBenefits: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const Customize = mongoose.model('Customize', customizeSchema);
export default Customize;