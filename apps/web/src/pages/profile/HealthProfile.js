import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Pencil, UserRound, } from "lucide-react";
import { getHealthProfile, saveHealthProfile, } from "../../api/profile";
const emptyForm = {
    age: "",
    gender: "",
    height: "",
    weight: "",
    smoking: "",
    alcohol: "",
    exerciseDays: "",
    sleepHours: "",
    allergies: "",
    medicalConditions: "",
    medications: "",
    emergencyName: "",
    emergencyPhone: "",
};
const GENDER_LABELS = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
    PREFER_NOT_TO_SAY: "Prefer not to say",
};
const PHONE_REGEX = /^[+]?[0-9\s-]{7,20}$/;
const boolToForm = (value) => value === true ? "true" : value === false ? "false" : "";
const profileToForm = (profile) => {
    if (!profile)
        return emptyForm;
    return {
        age: profile.age?.toString() ?? "",
        gender: profile.gender ?? "",
        height: profile.height?.toString() ?? "",
        weight: profile.weight?.toString() ?? "",
        smoking: boolToForm(profile.smoking),
        alcohol: boolToForm(profile.alcohol),
        exerciseDays: profile.exerciseDays?.toString() ?? "",
        sleepHours: profile.sleepHours?.toString() ?? "",
        allergies: profile.allergies ?? "",
        medicalConditions: profile.medicalConditions ?? "",
        medications: profile.medications ?? "",
        emergencyName: profile.emergencyName ?? "",
        emergencyPhone: profile.emergencyPhone ?? "",
    };
};
const validateForm = (form) => {
    const errors = {};
    const age = form.age.trim() === "" ? null : Number(form.age);
    if (age !== null &&
        (!Number.isInteger(age) || age < 1 || age > 120)) {
        errors.age = "Enter an age between 1 and 120";
    }
    const height = form.height.trim() === "" ? null : Number(form.height);
    if (height !== null &&
        (height < 50 || height > 272)) {
        errors.height = "Enter a height between 50 and 272 cm";
    }
    const weight = form.weight.trim() === "" ? null : Number(form.weight);
    if (weight !== null &&
        (weight < 2 || weight > 500)) {
        errors.weight = "Enter a weight between 2 and 500 kg";
    }
    const exerciseDays = form.exerciseDays.trim() === ""
        ? null
        : Number(form.exerciseDays);
    if (exerciseDays !== null &&
        (!Number.isInteger(exerciseDays) ||
            exerciseDays < 0 ||
            exerciseDays > 7)) {
        errors.exerciseDays =
            "Enter a value between 0 and 7 days";
    }
    const sleepHours = form.sleepHours.trim() === ""
        ? null
        : Number(form.sleepHours);
    if (sleepHours !== null &&
        (sleepHours < 0 || sleepHours > 24)) {
        errors.sleepHours =
            "Enter a value between 0 and 24 hours";
    }
    const emergencyPhone = form.emergencyPhone.trim() || null;
    if (emergencyPhone &&
        !PHONE_REGEX.test(emergencyPhone)) {
        errors.emergencyPhone = "Enter a valid phone number";
    }
    if (Object.keys(errors).length > 0) {
        return { errors, payload: null };
    }
    const payload = {
        age,
        gender: form.gender || null,
        height,
        weight,
        smoking: form.smoking === "" ? null : form.smoking === "true",
        alcohol: form.alcohol === "" ? null : form.alcohol === "true",
        exerciseDays,
        sleepHours,
        allergies: form.allergies.trim() || null,
        medicalConditions: form.medicalConditions.trim() || null,
        medications: form.medications.trim() || null,
        emergencyName: form.emergencyName.trim() || null,
        emergencyPhone,
    };
    return { errors: {}, payload };
};
const renderValue = (value) => {
    if (value === null ||
        value === undefined ||
        value === "") {
        return (_jsx("span", { className: "profile-empty-inline", children: "Not provided" }));
    }
    return value;
};
const formatBoolean = (value) => value === true ? "Yes" : value === false ? "No" : null;
const ViewSections = ({ profile, onEdit, }) => {
    return (_jsxs("div", { className: "glass-card profile-section", children: [_jsxs("div", { className: "profile-section-header", children: [_jsxs("div", { children: [_jsx("h3", { children: "Your health profile" }), _jsxs("p", { children: ["Last updated", " ", new Date(profile.updatedAt).toLocaleDateString()] })] }), _jsx("div", { className: "profile-header-actions", children: _jsxs("button", { type: "button", className: "profile-edit-button", onClick: onEdit, children: [_jsx(Pencil, { size: 14 }), "Edit profile"] }) })] }), _jsxs("div", { className: "profile-view-grid", children: [_jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Age" }), _jsx("strong", { children: renderValue(profile.age) })] }), _jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Gender" }), _jsx("strong", { children: profile.gender
                                    ? GENDER_LABELS[profile.gender]
                                    : renderValue(null) })] }), _jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Height" }), _jsx("strong", { children: profile.height
                                    ? `${profile.height} cm`
                                    : renderValue(null) })] }), _jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Weight" }), _jsx("strong", { children: profile.weight
                                    ? `${profile.weight} kg`
                                    : renderValue(null) })] }), _jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Smoking" }), _jsx("strong", { children: formatBoolean(profile.smoking) ??
                                    renderValue(null) })] }), _jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Alcohol" }), _jsx("strong", { children: formatBoolean(profile.alcohol) ??
                                    renderValue(null) })] }), _jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Exercise days/week" }), _jsx("strong", { children: renderValue(profile.exerciseDays) })] }), _jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Sleep hours" }), _jsx("strong", { children: renderValue(profile.sleepHours) })] }), _jsxs("div", { className: "profile-view-item full-width", children: [_jsx("span", { children: "Allergies" }), _jsx("strong", { children: renderValue(profile.allergies) })] }), _jsxs("div", { className: "profile-view-item full-width", children: [_jsx("span", { children: "Medical conditions" }), _jsx("strong", { children: renderValue(profile.medicalConditions) })] }), _jsxs("div", { className: "profile-view-item full-width", children: [_jsx("span", { children: "Current medications" }), _jsx("strong", { children: renderValue(profile.medications) })] }), _jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Emergency contact name" }), _jsx("strong", { children: renderValue(profile.emergencyName) })] }), _jsxs("div", { className: "profile-view-item", children: [_jsx("span", { children: "Emergency contact phone" }), _jsx("strong", { children: renderValue(profile.emergencyPhone) })] })] })] }));
};
const EditSections = ({ form, errors, updateField, }) => {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsx("h3", { children: "Basic information" }), _jsx("p", { children: "All fields are optional" })] }) }), _jsxs("div", { className: "profile-grid", children: [_jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "age", children: "Age" }), _jsx("input", { id: "age", type: "number", inputMode: "numeric", value: form.age, onChange: (e) => updateField("age", e.target.value), placeholder: "e.g. 32", className: errors.age ? "field-error" : "" }), errors.age && (_jsx("span", { className: "profile-field-error", children: errors.age }))] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "gender", children: "Gender" }), _jsxs("select", { id: "gender", value: form.gender, onChange: (e) => updateField("gender", e.target.value), children: [_jsx("option", { value: "", children: "Not specified" }), _jsx("option", { value: "MALE", children: "Male" }), _jsx("option", { value: "FEMALE", children: "Female" }), _jsx("option", { value: "OTHER", children: "Other" }), _jsx("option", { value: "PREFER_NOT_TO_SAY", children: "Prefer not to say" })] })] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "height", children: "Height (cm)" }), _jsx("input", { id: "height", type: "number", inputMode: "decimal", value: form.height, onChange: (e) => updateField("height", e.target.value), placeholder: "e.g. 170", className: errors.height ? "field-error" : "" }), errors.height && (_jsx("span", { className: "profile-field-error", children: errors.height }))] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "weight", children: "Weight (kg)" }), _jsx("input", { id: "weight", type: "number", inputMode: "decimal", value: form.weight, onChange: (e) => updateField("weight", e.target.value), placeholder: "e.g. 68", className: errors.weight ? "field-error" : "" }), errors.weight && (_jsx("span", { className: "profile-field-error", children: errors.weight }))] })] })] }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsx("h3", { children: "Lifestyle" }), _jsx("p", { children: "Powers your preventive wellness indicators" })] }) }), _jsxs("div", { className: "profile-grid", children: [_jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "smoking", children: "Smoking" }), _jsxs("select", { id: "smoking", value: form.smoking, onChange: (e) => updateField("smoking", e.target.value), children: [_jsx("option", { value: "", children: "Not specified" }), _jsx("option", { value: "false", children: "No" }), _jsx("option", { value: "true", children: "Yes" })] })] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "alcohol", children: "Alcohol" }), _jsxs("select", { id: "alcohol", value: form.alcohol, onChange: (e) => updateField("alcohol", e.target.value), children: [_jsx("option", { value: "", children: "Not specified" }), _jsx("option", { value: "false", children: "No" }), _jsx("option", { value: "true", children: "Yes" })] })] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "exerciseDays", children: "Exercise days per week" }), _jsx("input", { id: "exerciseDays", type: "number", inputMode: "numeric", value: form.exerciseDays, onChange: (e) => updateField("exerciseDays", e.target.value), placeholder: "0-7", className: errors.exerciseDays ? "field-error" : "" }), errors.exerciseDays && (_jsx("span", { className: "profile-field-error", children: errors.exerciseDays }))] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "sleepHours", children: "Sleep hours per night" }), _jsx("input", { id: "sleepHours", type: "number", inputMode: "decimal", step: "0.5", value: form.sleepHours, onChange: (e) => updateField("sleepHours", e.target.value), placeholder: "e.g. 7", className: errors.sleepHours ? "field-error" : "" }), errors.sleepHours && (_jsx("span", { className: "profile-field-error", children: errors.sleepHours }))] })] })] }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsx("h3", { children: "Medical information" }), _jsx("p", { children: "Optional context to keep on record" })] }) }), _jsxs("div", { className: "profile-grid", children: [_jsxs("div", { className: "profile-field full-width", children: [_jsx("label", { htmlFor: "allergies", children: "Allergies" }), _jsx("textarea", { id: "allergies", value: form.allergies, onChange: (e) => updateField("allergies", e.target.value), placeholder: "e.g. Penicillin, peanuts", maxLength: 300 })] }), _jsxs("div", { className: "profile-field full-width", children: [_jsx("label", { htmlFor: "medicalConditions", children: "Medical conditions" }), _jsx("textarea", { id: "medicalConditions", value: form.medicalConditions, onChange: (e) => updateField("medicalConditions", e.target.value), placeholder: "e.g. Asthma, hypertension", maxLength: 300 })] }), _jsxs("div", { className: "profile-field full-width", children: [_jsx("label", { htmlFor: "medications", children: "Current medications" }), _jsx("textarea", { id: "medications", value: form.medications, onChange: (e) => updateField("medications", e.target.value), placeholder: "e.g. Metformin 500mg daily", maxLength: 300 })] })] })] }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsx("h3", { children: "Emergency contact" }), _jsx("p", { children: "Reflected in your dashboard's emergency information" })] }) }), _jsxs("div", { className: "profile-grid", children: [_jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "emergencyName", children: "Contact name" }), _jsx("input", { id: "emergencyName", type: "text", value: form.emergencyName, onChange: (e) => updateField("emergencyName", e.target.value), placeholder: "e.g. Mom", maxLength: 100 })] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "emergencyPhone", children: "Contact phone" }), _jsx("input", { id: "emergencyPhone", type: "tel", value: form.emergencyPhone, onChange: (e) => updateField("emergencyPhone", e.target.value), placeholder: "e.g. +919876543210", className: errors.emergencyPhone
                                            ? "field-error"
                                            : "" }), errors.emergencyPhone && (_jsx("span", { className: "profile-field-error", children: errors.emergencyPhone }))] })] })] })] }));
};
const HealthProfile = () => {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [profile, setProfile] = useState(null);
    const [completion, setCompletion] = useState(0);
    const [mode, setMode] = useState("view");
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setLoadError("");
                const result = await getHealthProfile();
                setProfile(result.profile);
                setCompletion(result.completion);
                setForm(profileToForm(result.profile));
                if (!result.profile) {
                    setMode("edit");
                }
            }
            catch (error) {
                console.error("Failed to load health profile:", error);
                setLoadError("Unable to load your health profile. Please try again.");
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    const isDirty = useMemo(() => {
        const baseline = profileToForm(profile);
        return (JSON.stringify(baseline) !== JSON.stringify(form));
    }, [form, profile]);
    useEffect(() => {
        if (mode !== "edit" || !isDirty)
            return;
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [mode, isDirty]);
    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const startEdit = () => {
        setForm(profileToForm(profile));
        setErrors({});
        setSaveError("");
        setMode("edit");
    };
    const cancelEdit = () => {
        if (isDirty &&
            !window.confirm("Discard your unsaved changes?")) {
            return;
        }
        setForm(profileToForm(profile));
        setErrors({});
        setSaveError("");
        setMode("view");
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { errors: validationErrors, payload } = validateForm(form);
        setErrors(validationErrors);
        if (!payload)
            return;
        try {
            setSaving(true);
            setSaveError("");
            const result = await saveHealthProfile(payload);
            setProfile(result.profile);
            setCompletion(result.completion);
            setForm(profileToForm(result.profile));
            setMode("view");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
        catch (error) {
            console.error("Failed to save health profile:", error);
            setSaveError("Unable to save your health profile. Please try again.");
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "profile-page", children: _jsx("div", { className: "glass-card profile-loading", children: "Loading your health profile..." }) }));
    }
    if (loadError) {
        return (_jsx("div", { className: "profile-page", children: _jsxs("div", { className: "glass-card profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), loadError] }) }));
    }
    return (_jsxs("div", { className: "profile-page", children: [showSuccess && (_jsxs("div", { className: "glass-card profile-success-banner", children: [_jsx(CheckCircle2, { size: 16 }), "Health profile saved successfully."] })), _jsxs("div", { className: "glass-card profile-completion-banner", children: [_jsxs("div", { className: "profile-completion-top", children: [_jsxs("div", { children: [_jsx("h3", { children: "Profile completion" }), _jsx("p", { children: completion === 100
                                            ? "Your health profile is fully complete."
                                            : "Fill in more details for better personalized insights." })] }), _jsxs("span", { className: "profile-completion-percent", children: [completion, "%"] })] }), _jsx("div", { className: "profile-completion-track", children: _jsx("div", { className: "profile-completion-fill", style: { width: `${completion}%` } }) })] }), mode === "view" && !profile && (_jsxs("div", { className: "glass-card profile-setup-card", children: [_jsx("div", { className: "profile-setup-icon", children: _jsx(UserRound, { size: 26 }) }), _jsx("h2", { children: "Set up your health profile" }), _jsx("p", { children: "Add your age, lifestyle, medical history and emergency contact to unlock personalized wellness insights across your dashboard." }), _jsxs("button", { type: "button", className: "profile-edit-button", onClick: startEdit, children: [_jsx(Pencil, { size: 14 }), "Set up profile"] })] })), mode === "view" && profile && (_jsx(ViewSections, { profile: profile, onEdit: startEdit })), mode === "edit" && (_jsxs("form", { className: "profile-page", onSubmit: handleSubmit, children: [saveError && (_jsxs("div", { className: "glass-card profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), saveError] })), _jsx(EditSections, { form: form, errors: errors, updateField: updateField }), _jsxs("div", { className: "glass-card profile-section profile-actions-bar", children: [_jsx("button", { type: "button", className: "profile-cancel-button", onClick: cancelEdit, disabled: saving, children: "Cancel" }), _jsx("button", { type: "submit", className: "profile-save-button", disabled: saving, children: saving ? "Saving..." : "Save profile" })] })] }))] }));
};
export default HealthProfile;
