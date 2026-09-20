import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Copy,
  MapPin,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

interface EmergencyContact {
  name: string;
  phone: string;
}

interface EmergencyData {
  contacts: EmergencyContact[];
  bloodGroup: string;
  allergies: string;
  conditions: string;
}

const MAX_CONTACTS = 3;

const emptyContact = (): EmergencyContact => ({ name: "", phone: "" });

const defaultData: EmergencyData = {
  contacts: [emptyContact()],
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
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed?.contacts)) {
          setData(parsed);
        }
      } catch {
        localStorage.removeItem(
          "emergencyData"
        );
      }
    }
  }, []);

  const updateContact = (
    index: number,
    field: keyof EmergencyContact,
    value: string
  ) => {
    setData((prev) => {
      const contacts = [...prev.contacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, contacts };
    });
  };

  const addContact = () => {
    setData((prev) =>
      prev.contacts.length >= MAX_CONTACTS
        ? prev
        : { ...prev, contacts: [...prev.contacts, emptyContact()] }
    );
  };

  const removeContact = (index: number) => {
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const saveEmergencyData = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const cleanedContacts = data.contacts.filter(
      (contact) => contact.name.trim() || contact.phone.trim()
    );

    const cleaned: EmergencyData = {
      ...data,
      contacts:
        cleanedContacts.length > 0
          ? cleanedContacts
          : [emptyContact()],
    };

    setData(cleaned);

    localStorage.setItem(
      "emergencyData",
      JSON.stringify(cleaned)
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

      const contactsWithPhone = data.contacts.filter(
        (contact) => contact.phone.trim()
      );

      if (contactsWithPhone.length > 0) {
        contactsWithPhone.forEach((contact) => {
          window.open(
            `https://wa.me/${contact.phone.replace(
              /\D/g,
              ""
            )}?text=${message}`,
            "_blank"
          );
        });
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
    const primary = data.contacts.find(
      (contact) => contact.phone.trim()
    );

    if (!primary) {
      setShowForm(true);
      return;
    }

    window.location.href =
      `tel:${primary.phone}`;
  };

  const primaryContact = data.contacts.find(
    (contact) => contact.name.trim() || contact.phone.trim()
  );

  const savedContactsCount = data.contacts.filter(
    (contact) => contact.phone.trim()
  ).length;

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
            {primaryContact
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
              {primaryContact?.name ||
                "Medical ID not set"}
            </strong>

            <span>
              {data.bloodGroup
                ? `Blood group · ${data.bloodGroup}`
                : "Add your emergency information"}
            </span>

            <span>
              {savedContactsCount > 0
                ? `${savedContactsCount} emergency contact${
                    savedContactsCount > 1 ? "s" : ""
                  } saved`
                : "No emergency contact saved"}
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
          opens WhatsApp for every saved
          emergency contact. It does not
          automatically contact emergency
          services, and your browser may ask
          permission to open multiple tabs.
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
              <div className="emergency-contacts-list">
                {data.contacts.map((contact, index) => (
                  <div
                    className="emergency-contact-fieldset"
                    key={index}
                  >
                    <div className="emergency-contact-fieldset-header">
                      <span>Emergency contact {index + 1}</span>

                      {data.contacts.length > 1 && (
                        <button
                          type="button"
                          className="remove-contact-button"
                          onClick={() => removeContact(index)}
                          aria-label={`Remove contact ${index + 1}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <label>
                      <span>Name</span>

                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) =>
                          updateContact(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Mom"
                      />
                    </label>

                    <label>
                      <span>Phone number</span>

                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) =>
                          updateContact(
                            index,
                            "phone",
                            e.target.value
                          )
                        }
                        placeholder="e.g. +919876543210"
                      />
                    </label>
                  </div>
                ))}

                {data.contacts.length < MAX_CONTACTS && (
                  <button
                    type="button"
                    className="add-contact-button"
                    onClick={addContact}
                  >
                    <Plus size={14} />
                    Add another contact
                  </button>
                )}
              </div>

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