import { ClipboardCheck } from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

const HealthAnalysis = () => {
  return (
    <ComingSoon
      icon={ClipboardCheck}
      title="Health Analysis"
      description="A guided, structured health check-in that turns your profile and lifestyle data into educational wellness insights."
    />
  );
};

export default HealthAnalysis;
