import { jsx as _jsx } from "react/jsx-runtime";
import { Settings as SettingsIcon } from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";
const Settings = () => {
    return (_jsx(ComingSoon, { icon: SettingsIcon, title: "Settings", description: "Manage your account details, security preferences and privacy controls here." }));
};
export default Settings;
