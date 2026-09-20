import { UserRound } from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

const HealthProfile = () => {
  return (
    <ComingSoon
      icon={UserRound}
      title="Health Profile"
      description="Manage your age, lifestyle, medical history and emergency contacts here. This will power personalized wellness insights across your dashboard."
    />
  );
};

export default HealthProfile;
