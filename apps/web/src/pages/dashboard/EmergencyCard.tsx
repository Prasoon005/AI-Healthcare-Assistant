import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Copy,
  MapPin,
  Phone,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";

interface EmergencyData {
  name: string;
  phone: string;
  bloodGroup: string;
  allergies: string;
  conditions: string;
}

const defaultData: EmergencyData = {
  name: "",
  phone: "",
  bloodGroup: "",
  allergies: "",
  conditions: "",
};

const EmergencyCard = () => {
  const [data, setData] =
    useState<EmergencyData>(defaultData);

  const [showForm, setShowForm] =
    useState(false);

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [locationUrl, setLocationUrl] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "emergencyData"
      );

    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        localStorage.removeItem(
          "emergencyData"
        );
      }
    }
  }, []);

  const saveEmergencyData = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    localStorage.setItem(
      "emergencyData",
      JSON.stringify(data)
    );

    setShowForm(false);
  };

  const getLocation = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(
            new Error(
              "Geolocation is not supported."
            )
          );
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude:
                position.coords.latitude,
              longitude:
                position.coords.longitude,
            });
          },
          () => {
            reject(
              new Error(
                "Location permission denied."
              )
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    );
  };

  const handleSOS = async () => {
    try {
      setLoadingLocation(true);

      const location =
        await getLocation();

      const url =
        `https://www.google.com/maps?q=` +
        `${location.latitude},${location.longitude}`;

      setLocationUrl(url);

      const message = encodeURIComponent(
        `EMERGENCY ALERT\n\n` +
        `I may need help.\n` +
        `My current location:\n${url}`
      );

      if (data.phone) {
        window.open(
          `https://wa.me/${data.phone.replace(
            /\D/g,
            ""
          )}?text=${message}`,
          "_blank"
        );
      } else {
        await navigator.clipboard?.writeText(
          url
        );

        alert(
          "Location link copied. Add an emergency contact to send it directly."
        );
      }
    } catch (error) {
      console.error(
        "SOS location error:",
        error
      );

      alert(
        "Unable to access your location. Please allow location permission and try again."
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCopyLocation = async () => {
    if (!locationUrl) return;

    try {
      await navigator.clipboard.writeText(
        locationUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert(
        "Unable to copy location."
      );
    }
  };

  const callEmergencyContact = () => {
    if (!data.phone) {
      setShowForm(true);
      return;
    }

    window.location.href =
      `tel:${data.phone}`;
  };

  return (
    <>
      <div className="emergency-card glass-card">
        <div className="emergency-header">
          <div className="emergency-title">
            <div className="emergency-icon">
              <ShieldAlert size={19} />
            </div>

            <div>
              <h3>
                Emergency & Medical ID
              </h3>

              <p>
                Keep important information ready
              </p>
            </div>
          </div>

          <button
            type="button"
            className="medical-id-edit"
            onClick={() =>
              setShowForm(true)
            }
          >
            {data.name ||
            data.phone
              ? "Edit"
              : "Set up"}
          </button>
        </div>

        <div className="medical-id">
          <div className="medical-id-avatar">
            <UserRound size={20} />
          </div>

          <div className="medical-id-info">
            <strong>
              {data.name ||
                "Medical ID not set"}
            </strong>

            <span>
              {data.bloodGroup
                ? `Blood group · ${data.bloodGroup}`
                : "Add your emergency information"}
            </span>
          </div>
        </div>

        {(data.allergies ||
          data.conditions) && (
          <div className="medical-details">
            {data.allergies && (
              <div>
                <span>
                  Allergies
                </span>

                <strong>
                  {data.allergies}
                </strong>
              </div>
            )}

            {data.conditions && (
              <div>
                <span>
                  Conditions
                </span>

                <strong>
                  {data.conditions}
                </strong>
              </div>
            )}
          </div>
        )}

        <div className="emergency-actions">
          <button
            type="button"
            className="sos-button"
            onClick={handleSOS}
            disabled={loadingLocation}
          >
            <AlertTriangle size={19} />

            {loadingLocation
              ? "Getting location..."
              : "Emergency SOS"}
          </button>

          <button
            type="button"
            className="call-button"
            onClick={
              callEmergencyContact
            }
          >
            <Phone size={17} />

            Call contact
          </button>
        </div>

        {locationUrl && (
          <div className="location-result">
            <div>
              <MapPin size={15} />

              <span>
                Current location ready
              </span>
            </div>

            <button
              type="button"
              onClick={
                handleCopyLocation
              }
            >
              <Copy size={13} />

              {copied
                ? "Copied"
                : "Copy"}
            </button>
          </div>
        )}

        <p className="emergency-note">
          SOS uses your device location and
          opens your emergency contact through
          WhatsApp. It does not automatically
          contact emergency services.
        </p>
      </div>

      {showForm && (
        <div
          className="medical-modal-backdrop"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="medical-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="medical-modal-header">
              <div>
                <span>
                  Emergency profile
                </span>

                <h3>
                  Medical ID
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={
                saveEmergencyData
              }
            >
              <label>
                <span>
                  Emergency contact name
                </span>

                <input
                  type="text"
                  value={data.name}
                  onChange={(e) =>
                    setData({
                      ...data,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Mom"
                />
              </label>

              <label>
                <span>
                  Phone number
                </span>

                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) =>
                    setData({
                      ...data,
                      phone:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. +919876543210"
                />
              </label>

              <label>
                <span>
                  Blood group
                </span>

                <input
                  type="text"
                  value={
                    data.bloodGroup
                  }
                  onChange={(e) =>
                    setData({
                      ...data,
                      bloodGroup:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. O+"
                />
              </label>

              <label>
                <span>
                  Allergies
                </span>

                <input
                  type="text"
                  value={
                    data.allergies
                  }
                  onChange={(e) =>
                    setData({
                      ...data,
                      allergies:
                        e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                <span>
                  Medical conditions
                </span>

                <input
                  type="text"
                  value={
                    data.conditions
                  }
                  onChange={(e) =>
                    setData({
                      ...data,
                      conditions:
                        e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </label>

              <button
                type="submit"
                className="save-medical-id"
              >
                Save Medical ID
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyCard;