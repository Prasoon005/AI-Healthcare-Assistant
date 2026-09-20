import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AlertTriangle, Copy, MapPin, Phone, Plus, ShieldAlert, Trash2, UserRound, X, } from "lucide-react";
import { getHealthProfile } from "../../api/profile";
const MAX_CONTACTS = 3;
const emptyContact = () => ({ name: "", phone: "" });
const defaultData = {
    contacts: [emptyContact()],
    bloodGroup: "",
    allergies: "",
    conditions: "",
};
const EmergencyCard = () => {
    const [data, setData] = useState(defaultData);
    const [showForm, setShowForm] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [locationUrl, setLocationUrl] = useState("");
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem("emergencyData");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed?.contacts)) {
                    setData(parsed);
                }
            }
            catch {
                localStorage.removeItem("emergencyData");
            }
            return;
        }
        // No local emergency data yet — seed the first
        // contact from the health profile's emergency
        // contact, without overwriting anything the user
        // has already entered here.
        getHealthProfile()
            .then((result) => {
            const emergencyName = result.profile?.emergencyName?.trim();
            const emergencyPhone = result.profile?.emergencyPhone?.trim();
            if (!emergencyName && !emergencyPhone)
                return;
            setData({
                ...defaultData,
                contacts: [
                    {
                        name: emergencyName || "",
                        phone: emergencyPhone || "",
                    },
                ],
            });
        })
            .catch((error) => {
            console.error("Failed to load health profile for emergency contact:", error);
        });
    }, []);
    const updateContact = (index, field, value) => {
        setData((prev) => {
            const contacts = [...prev.contacts];
            contacts[index] = { ...contacts[index], [field]: value };
            return { ...prev, contacts };
        });
    };
    const addContact = () => {
        setData((prev) => prev.contacts.length >= MAX_CONTACTS
            ? prev
            : { ...prev, contacts: [...prev.contacts, emptyContact()] });
    };
    const removeContact = (index) => {
        setData((prev) => ({
            ...prev,
            contacts: prev.contacts.filter((_, i) => i !== index),
        }));
    };
    const saveEmergencyData = (e) => {
        e.preventDefault();
        const cleanedContacts = data.contacts.filter((contact) => contact.name.trim() || contact.phone.trim());
        const cleaned = {
            ...data,
            contacts: cleanedContacts.length > 0
                ? cleanedContacts
                : [emptyContact()],
        };
        setData(cleaned);
        localStorage.setItem("emergencyData", JSON.stringify(cleaned));
        setShowForm(false);
    };
    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported."));
                return;
            }
            navigator.geolocation.getCurrentPosition((position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            }, () => {
                reject(new Error("Location permission denied."));
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        });
    };
    const handleSOS = async () => {
        try {
            setLoadingLocation(true);
            const location = await getLocation();
            const url = `https://www.google.com/maps?q=` +
                `${location.latitude},${location.longitude}`;
            setLocationUrl(url);
            const message = encodeURIComponent(`EMERGENCY ALERT\n\n` +
                `I may need help.\n` +
                `My current location:\n${url}`);
            const contactsWithPhone = data.contacts.filter((contact) => contact.phone.trim());
            if (contactsWithPhone.length > 0) {
                contactsWithPhone.forEach((contact) => {
                    window.open(`https://wa.me/${contact.phone.replace(/\D/g, "")}?text=${message}`, "_blank");
                });
            }
            else {
                await navigator.clipboard?.writeText(url);
                alert("Location link copied. Add an emergency contact to send it directly.");
            }
        }
        catch (error) {
            console.error("SOS location error:", error);
            alert("Unable to access your location. Please allow location permission and try again.");
        }
        finally {
            setLoadingLocation(false);
        }
    };
    const handleCopyLocation = async () => {
        if (!locationUrl)
            return;
        try {
            await navigator.clipboard.writeText(locationUrl);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
        catch {
            alert("Unable to copy location.");
        }
    };
    const callEmergencyContact = () => {
        const primary = data.contacts.find((contact) => contact.phone.trim());
        if (!primary) {
            setShowForm(true);
            return;
        }
        window.location.href =
            `tel:${primary.phone}`;
    };
    const primaryContact = data.contacts.find((contact) => contact.name.trim() || contact.phone.trim());
    const savedContactsCount = data.contacts.filter((contact) => contact.phone.trim()).length;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "emergency-card glass-card", children: [_jsxs("div", { className: "emergency-header", children: [_jsxs("div", { className: "emergency-title", children: [_jsx("div", { className: "emergency-icon", children: _jsx(ShieldAlert, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: "Emergency & Medical ID" }), _jsx("p", { children: "Keep important information ready" })] })] }), _jsx("button", { type: "button", className: "medical-id-edit", onClick: () => setShowForm(true), children: primaryContact
                                    ? "Edit"
                                    : "Set up" })] }), _jsxs("div", { className: "medical-id", children: [_jsx("div", { className: "medical-id-avatar", children: _jsx(UserRound, { size: 20 }) }), _jsxs("div", { className: "medical-id-info", children: [_jsx("strong", { children: primaryContact?.name ||
                                            "Medical ID not set" }), _jsx("span", { children: data.bloodGroup
                                            ? `Blood group · ${data.bloodGroup}`
                                            : "Add your emergency information" }), _jsx("span", { children: savedContactsCount > 0
                                            ? `${savedContactsCount} emergency contact${savedContactsCount > 1 ? "s" : ""} saved`
                                            : "No emergency contact saved" })] })] }), (data.allergies ||
                        data.conditions) && (_jsxs("div", { className: "medical-details", children: [data.allergies && (_jsxs("div", { children: [_jsx("span", { children: "Allergies" }), _jsx("strong", { children: data.allergies })] })), data.conditions && (_jsxs("div", { children: [_jsx("span", { children: "Conditions" }), _jsx("strong", { children: data.conditions })] }))] })), _jsxs("div", { className: "emergency-actions", children: [_jsxs("button", { type: "button", className: "sos-button", onClick: handleSOS, disabled: loadingLocation, children: [_jsx(AlertTriangle, { size: 19 }), loadingLocation
                                        ? "Getting location..."
                                        : "Emergency SOS"] }), _jsxs("button", { type: "button", className: "call-button", onClick: callEmergencyContact, children: [_jsx(Phone, { size: 17 }), "Call contact"] })] }), locationUrl && (_jsxs("div", { className: "location-result", children: [_jsxs("div", { children: [_jsx(MapPin, { size: 15 }), _jsx("span", { children: "Current location ready" })] }), _jsxs("button", { type: "button", onClick: handleCopyLocation, children: [_jsx(Copy, { size: 13 }), copied
                                        ? "Copied"
                                        : "Copy"] })] })), _jsx("p", { className: "emergency-note", children: "SOS uses your device location and opens WhatsApp for every saved emergency contact. It does not automatically contact emergency services, and your browser may ask permission to open multiple tabs." })] }), showForm && (_jsx("div", { className: "medical-modal-backdrop", onMouseDown: (e) => {
                    if (e.target ===
                        e.currentTarget) {
                        setShowForm(false);
                    }
                }, children: _jsxs("div", { className: "medical-modal", onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "medical-modal-header", children: [_jsxs("div", { children: [_jsx("span", { children: "Emergency profile" }), _jsx("h3", { children: "Medical ID" })] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), "aria-label": "Close", children: _jsx(X, { size: 18 }) })] }), _jsxs("form", { onSubmit: saveEmergencyData, children: [_jsxs("div", { className: "emergency-contacts-list", children: [data.contacts.map((contact, index) => (_jsxs("div", { className: "emergency-contact-fieldset", children: [_jsxs("div", { className: "emergency-contact-fieldset-header", children: [_jsxs("span", { children: ["Emergency contact ", index + 1] }), data.contacts.length > 1 && (_jsx("button", { type: "button", className: "remove-contact-button", onClick: () => removeContact(index), "aria-label": `Remove contact ${index + 1}`, children: _jsx(Trash2, { size: 14 }) }))] }), _jsxs("label", { children: [_jsx("span", { children: "Name" }), _jsx("input", { type: "text", value: contact.name, onChange: (e) => updateContact(index, "name", e.target.value), placeholder: "e.g. Mom" })] }), _jsxs("label", { children: [_jsx("span", { children: "Phone number" }), _jsx("input", { type: "tel", value: contact.phone, onChange: (e) => updateContact(index, "phone", e.target.value), placeholder: "e.g. +919876543210" })] })] }, index))), data.contacts.length < MAX_CONTACTS && (_jsxs("button", { type: "button", className: "add-contact-button", onClick: addContact, children: [_jsx(Plus, { size: 14 }), "Add another contact"] }))] }), _jsxs("label", { children: [_jsx("span", { children: "Blood group" }), _jsx("input", { type: "text", value: data.bloodGroup, onChange: (e) => setData({
                                                ...data,
                                                bloodGroup: e.target.value,
                                            }), placeholder: "e.g. O+" })] }), _jsxs("label", { children: [_jsx("span", { children: "Allergies" }), _jsx("input", { type: "text", value: data.allergies, onChange: (e) => setData({
                                                ...data,
                                                allergies: e.target.value,
                                            }), placeholder: "Optional" })] }), _jsxs("label", { children: [_jsx("span", { children: "Medical conditions" }), _jsx("input", { type: "text", value: data.conditions, onChange: (e) => setData({
                                                ...data,
                                                conditions: e.target.value,
                                            }), placeholder: "Optional" })] }), _jsx("button", { type: "submit", className: "save-medical-id", children: "Save Medical ID" })] })] }) }))] }));
};
export default EmergencyCard;
