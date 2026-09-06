import { useEffect, useState } from "react";
import {
  Activity,
  Brain,
  HeartPulse,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  getRiskMatrix,
  type RiskItem,
} from "../../api/risk";

const icons = {
  cardio: HeartPulse,
  metabolic: Activity,
  recovery: Brain,
};

const RiskMatrix = () => {
  const [items, setItems] = useState<RiskItem[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [available, setAvailable] =
    useState(false);

  const [completeness, setCompleteness] =
    useState(0);

  const [disclaimer, setDisclaimer] =
    useState("");

  const loadRiskMatrix = async () => {
    try {
      setLoading(true);

      const data = await getRiskMatrix();

      setAvailable(data.available);
      setItems(data.items);
      setCompleteness(
        data.completeness
      );
      setDisclaimer(
        data.disclaimer ?? ""
      );
    } catch (error) {
      console.error(
        "Failed to load risk matrix:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskMatrix();
  }, []);

  const getIcon = (key: string) => {
    if (
      key in icons
    ) {
      return icons[
        key as keyof typeof icons
      ];
    }

    return Activity;
  };

  const getLevelLabel = (
    level: RiskItem["level"]
  ) => {
    if (level === "low") {
      return "Low attention";
    }

    if (level === "moderate") {
      return "Moderate attention";
    }

    return "Higher attention";
  };

  if (loading) {
    return (
      <div className="risk-matrix-card glass-card">
        <div className="risk-loading">
          Loading wellness assessment...
        </div>
      </div>
    );
  }

  return (
    <div className="risk-matrix-card glass-card">
      <div className="risk-header">
        <div className="risk-title">
          <div className="risk-main-icon">
            <ShieldCheck size={19} />
          </div>

          <div>
            <h3>
              Preventive wellness
            </h3>

            <p>
              Lifestyle-based attention indicators
            </p>
          </div>
        </div>

        {available && (
          <div className="risk-completeness">
            {completeness}% profile
          </div>
        )}
      </div>

      {!available ? (
        <div className="risk-unavailable">
          <ShieldCheck size={25} />

          <strong>
            Complete your health profile
          </strong>

          <span>
            Add your age, activity, sleep and
            lifestyle details to generate
            personalized wellness indicators.
          </span>
        </div>
      ) : (
        <>
          <div className="risk-grid">
            {items.map((item) => {
              const Icon =
                getIcon(item.key);

              return (
                <div
                  className={`risk-item ${item.level}`}
                  key={item.key}
                >
                  <div className="risk-item-top">
                    <div className="risk-item-icon">
                      <Icon size={17} />
                    </div>

                    <span
                      className={`risk-badge ${item.level}`}
                    >
                      {getLevelLabel(
                        item.level
                      )}
                    </span>
                  </div>

                  <div className="risk-item-content">
                    <strong>
                      {item.label}
                    </strong>

                    <p>
                      {item.description}
                    </p>
                  </div>

                  <div className="risk-meter">
                    <div
                      className="risk-meter-fill"
                      style={{
                        width: `${item.score}%`,
                      }}
                    />
                  </div>

                  <div className="risk-score">
                    <span>
                      Attention indicator
                    </span>

                    <strong>
                      {item.score}/100
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="risk-disclaimer">
            <X size={13} />

            <span>
              {disclaimer ||
                "These indicators are educational wellness signals and are not a medical diagnosis."}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default RiskMatrix;