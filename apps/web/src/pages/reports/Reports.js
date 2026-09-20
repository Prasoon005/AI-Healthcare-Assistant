import { jsx as _jsx } from "react/jsx-runtime";
import { FileText } from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";
const Reports = () => {
    return (_jsx(ComingSoon, { icon: FileText, title: "Health Reports", description: "Once you complete a Health Analysis, your reports will appear here with a summary of your observations and wellness recommendations." }));
};
export default Reports;
