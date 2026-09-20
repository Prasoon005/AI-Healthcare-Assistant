import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Pencil,
  UserRound,
} from "lucide-react";

import {
  getHealthProfile,
  saveHealthProfile,
  type Gender,
  type HealthProfile as HealthProfileData,
  type UpdateProfileInput,
} from "../../api/profile";

interface FormState {
  age: string;
  gender: Gender | "";
  height: string;
  weight: string;
  smoking: "" | "true" | "false";
  alcohol: "" | "true" | "false";
  exerciseDays: string;
  sleepHours: string;
  allergies: string;
  medicalConditions: string;
  medications: string;
  emergencyName: string;
  emergencyPhone: string;
}

const emptyForm: FormState = {
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

const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

const PHONE_REGEX = /^[+]?[0-9\s-]{7,20}$/;

const boolToForm = (
  value: boolean | null
): FormState["smoking"] =>
  value === true ? "true" : value === false ? "false" : "";

const profileToForm = (
  profile: HealthProfileData | null
): FormState => {
  if (!profile) return emptyForm;

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

type FieldErrors = Partial<Record<keyof FormState, string>>;

const validateForm = (
  form: FormState
): {
  errors: FieldErrors;
  payload: UpdateProfileInput | null;
} => {
  const errors: FieldErrors = {};

  const age =
    form.age.trim() === "" ? null : Number(form.age);

  if (
    age !== null &&
    (!Number.isInteger(age) || age < 1 || age > 120)
  ) {
    errors.age = "Enter an age between 1 and 120";
  }

  const height =
    form.height.trim() === "" ? null : Number(form.height);

  if (
    height !== null &&
    (height < 50 || height > 272)
  ) {
    errors.height = "Enter a height between 50 and 272 cm";
  }

  const weight =
    form.weight.trim() === "" ? null : Number(form.weight);

  if (
    weight !== null &&
    (weight < 2 || weight > 500)
  ) {
    errors.weight = "Enter a weight between 2 and 500 kg";
  }

  const exerciseDays =
    form.exerciseDays.trim() === ""
      ? null
      : Number(form.exerciseDays);

  if (
    exerciseDays !== null &&
    (!Number.isInteger(exerciseDays) ||
      exerciseDays < 0 ||
      exerciseDays > 7)
  ) {
    errors.exerciseDays =
      "Enter a value between 0 and 7 days";
  }

  const sleepHours =
    form.sleepHours.trim() === ""
      ? null
      : Number(form.sleepHours);

  if (
    sleepHours !== null &&
    (sleepHours < 0 || sleepHours > 24)
  ) {
    errors.sleepHours =
      "Enter a value between 0 and 24 hours";
  }

  const emergencyPhone =
    form.emergencyPhone.trim() || null;

  if (
    emergencyPhone &&
    !PHONE_REGEX.test(emergencyPhone)
  ) {
    errors.emergencyPhone = "Enter a valid phone number";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  const payload: UpdateProfileInput = {
    age,
    gender: form.gender || null,
    height,
    weight,
    smoking:
      form.smoking === "" ? null : form.smoking === "true",
    alcohol:
      form.alcohol === "" ? null : form.alcohol === "true",
    exerciseDays,
    sleepHours,
    allergies: form.allergies.trim() || null,
    medicalConditions:
      form.medicalConditions.trim() || null,
    medications: form.medications.trim() || null,
    emergencyName: form.emergencyName.trim() || null,
    emergencyPhone,
  };

  return { errors: {}, payload };
};

const renderValue = (
  value: string | number | null | undefined
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return (
      <span className="profile-empty-inline">
        Not provided
      </span>
    );
  }

  return value;
};

const formatBoolean = (value: boolean | null) =>
  value === true ? "Yes" : value === false ? "No" : null;

interface ViewSectionsProps {
  profile: HealthProfileData;
  onEdit: () => void;
}

const ViewSections = ({
  profile,
  onEdit,
}: ViewSectionsProps) => {
  return (
    <div className="glass-card profile-section">
      <div className="profile-section-header">
        <div>
          <h3>Your health profile</h3>
          <p>
            Last updated{" "}
            {new Date(
              profile.updatedAt
            ).toLocaleDateString()}
          </p>
        </div>

        <div className="profile-header-actions">
          <button
            type="button"
            className="profile-edit-button"
            onClick={onEdit}
          >
            <Pencil size={14} />
            Edit profile
          </button>
        </div>
      </div>

      <div className="profile-view-grid">
        <div className="profile-view-item">
          <span>Age</span>
          <strong>{renderValue(profile.age)}</strong>
        </div>

        <div className="profile-view-item">
          <span>Gender</span>
          <strong>
            {profile.gender
              ? GENDER_LABELS[profile.gender]
              : renderValue(null)}
          </strong>
        </div>

        <div className="profile-view-item">
          <span>Height</span>
          <strong>
            {profile.height
              ? `${profile.height} cm`
              : renderValue(null)}
          </strong>
        </div>

        <div className="profile-view-item">
          <span>Weight</span>
          <strong>
            {profile.weight
              ? `${profile.weight} kg`
              : renderValue(null)}
          </strong>
        </div>

        <div className="profile-view-item">
          <span>Smoking</span>
          <strong>
            {formatBoolean(profile.smoking) ??
              renderValue(null)}
          </strong>
        </div>

        <div className="profile-view-item">
          <span>Alcohol</span>
          <strong>
            {formatBoolean(profile.alcohol) ??
              renderValue(null)}
          </strong>
        </div>

        <div className="profile-view-item">
          <span>Exercise days/week</span>
          <strong>
            {renderValue(profile.exerciseDays)}
          </strong>
        </div>

        <div className="profile-view-item">
          <span>Sleep hours</span>
          <strong>
            {renderValue(profile.sleepHours)}
          </strong>
        </div>

        <div className="profile-view-item full-width">
          <span>Allergies</span>
          <strong>
            {renderValue(profile.allergies)}
          </strong>
        </div>

        <div className="profile-view-item full-width">
          <span>Medical conditions</span>
          <strong>
            {renderValue(profile.medicalConditions)}
          </strong>
        </div>

        <div className="profile-view-item full-width">
          <span>Current medications</span>
          <strong>
            {renderValue(profile.medications)}
          </strong>
        </div>

        <div className="profile-view-item">
          <span>Emergency contact name</span>
          <strong>
            {renderValue(profile.emergencyName)}
          </strong>
        </div>

        <div className="profile-view-item">
          <span>Emergency contact phone</span>
          <strong>
            {renderValue(profile.emergencyPhone)}
          </strong>
        </div>
      </div>
    </div>
  );
};

interface EditSectionsProps {
  form: FormState;
  errors: FieldErrors;
  updateField: <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => void;
}

const EditSections = ({
  form,
  errors,
  updateField,
}: EditSectionsProps) => {
  return (
    <>
      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>Basic information</h3>
            <p>All fields are optional</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-field">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              inputMode="numeric"
              value={form.age}
              onChange={(e) =>
                updateField("age", e.target.value)
              }
              placeholder="e.g. 32"
              className={errors.age ? "field-error" : ""}
            />
            {errors.age && (
              <span className="profile-field-error">
                {errors.age}
              </span>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              value={form.gender}
              onChange={(e) =>
                updateField(
                  "gender",
                  e.target.value as Gender | ""
                )
              }
            >
              <option value="">Not specified</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">
                Prefer not to say
              </option>
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="height">Height (cm)</label>
            <input
              id="height"
              type="number"
              inputMode="decimal"
              value={form.height}
              onChange={(e) =>
                updateField("height", e.target.value)
              }
              placeholder="e.g. 170"
              className={
                errors.height ? "field-error" : ""
              }
            />
            {errors.height && (
              <span className="profile-field-error">
                {errors.height}
              </span>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              value={form.weight}
              onChange={(e) =>
                updateField("weight", e.target.value)
              }
              placeholder="e.g. 68"
              className={
                errors.weight ? "field-error" : ""
              }
            />
            {errors.weight && (
              <span className="profile-field-error">
                {errors.weight}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>Lifestyle</h3>
            <p>
              Powers your preventive wellness indicators
            </p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-field">
            <label htmlFor="smoking">Smoking</label>
            <select
              id="smoking"
              value={form.smoking}
              onChange={(e) =>
                updateField(
                  "smoking",
                  e.target.value as FormState["smoking"]
                )
              }
            >
              <option value="">Not specified</option>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="alcohol">Alcohol</label>
            <select
              id="alcohol"
              value={form.alcohol}
              onChange={(e) =>
                updateField(
                  "alcohol",
                  e.target.value as FormState["alcohol"]
                )
              }
            >
              <option value="">Not specified</option>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="exerciseDays">
              Exercise days per week
            </label>
            <input
              id="exerciseDays"
              type="number"
              inputMode="numeric"
              value={form.exerciseDays}
              onChange={(e) =>
                updateField(
                  "exerciseDays",
                  e.target.value
                )
              }
              placeholder="0-7"
              className={
                errors.exerciseDays ? "field-error" : ""
              }
            />
            {errors.exerciseDays && (
              <span className="profile-field-error">
                {errors.exerciseDays}
              </span>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="sleepHours">
              Sleep hours per night
            </label>
            <input
              id="sleepHours"
              type="number"
              inputMode="decimal"
              step="0.5"
              value={form.sleepHours}
              onChange={(e) =>
                updateField(
                  "sleepHours",
                  e.target.value
                )
              }
              placeholder="e.g. 7"
              className={
                errors.sleepHours ? "field-error" : ""
              }
            />
            {errors.sleepHours && (
              <span className="profile-field-error">
                {errors.sleepHours}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>Medical information</h3>
            <p>Optional context to keep on record</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-field full-width">
            <label htmlFor="allergies">Allergies</label>
            <textarea
              id="allergies"
              value={form.allergies}
              onChange={(e) =>
                updateField(
                  "allergies",
                  e.target.value
                )
              }
              placeholder="e.g. Penicillin, peanuts"
              maxLength={300}
            />
          </div>

          <div className="profile-field full-width">
            <label htmlFor="medicalConditions">
              Medical conditions
            </label>
            <textarea
              id="medicalConditions"
              value={form.medicalConditions}
              onChange={(e) =>
                updateField(
                  "medicalConditions",
                  e.target.value
                )
              }
              placeholder="e.g. Asthma, hypertension"
              maxLength={300}
            />
          </div>

          <div className="profile-field full-width">
            <label htmlFor="medications">
              Current medications
            </label>
            <textarea
              id="medications"
              value={form.medications}
              onChange={(e) =>
                updateField(
                  "medications",
                  e.target.value
                )
              }
              placeholder="e.g. Metformin 500mg daily"
              maxLength={300}
            />
          </div>
        </div>
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>Emergency contact</h3>
            <p>
              Reflected in your dashboard's emergency
              information
            </p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-field">
            <label htmlFor="emergencyName">
              Contact name
            </label>
            <input
              id="emergencyName"
              type="text"
              value={form.emergencyName}
              onChange={(e) =>
                updateField(
                  "emergencyName",
                  e.target.value
                )
              }
              placeholder="e.g. Mom"
              maxLength={100}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="emergencyPhone">
              Contact phone
            </label>
            <input
              id="emergencyPhone"
              type="tel"
              value={form.emergencyPhone}
              onChange={(e) =>
                updateField(
                  "emergencyPhone",
                  e.target.value
                )
              }
              placeholder="e.g. +919876543210"
              className={
                errors.emergencyPhone
                  ? "field-error"
                  : ""
              }
            />
            {errors.emergencyPhone && (
              <span className="profile-field-error">
                {errors.emergencyPhone}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const HealthProfile = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] =
    useState<HealthProfileData | null>(null);
  const [completion, setCompletion] = useState(0);
  const [mode, setMode] = useState<"view" | "edit">(
    "view"
  );
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
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
      } catch (error) {
        console.error(
          "Failed to load health profile:",
          error
        );

        setLoadError(
          "Unable to load your health profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const isDirty = useMemo(() => {
    const baseline = profileToForm(profile);
    return (
      JSON.stringify(baseline) !== JSON.stringify(form)
    );
  }, [form, profile]);

  useEffect(() => {
    if (mode !== "edit" || !isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () =>
      window.removeEventListener(
        "beforeunload",
        handler
      );
  }, [mode, isDirty]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = () => {
    setForm(profileToForm(profile));
    setErrors({});
    setSaveError("");
    setMode("edit");
  };

  const cancelEdit = () => {
    if (
      isDirty &&
      !window.confirm(
        "Discard your unsaved changes?"
      )
    ) {
      return;
    }

    setForm(profileToForm(profile));
    setErrors({});
    setSaveError("");
    setMode("view");
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const { errors: validationErrors, payload } =
      validateForm(form);

    setErrors(validationErrors);

    if (!payload) return;

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
    } catch (error) {
      console.error(
        "Failed to save health profile:",
        error
      );

      setSaveError(
        "Unable to save your health profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="glass-card profile-loading">
          Loading your health profile...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="profile-page">
        <div className="glass-card profile-error-banner">
          <AlertTriangle size={16} />
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {showSuccess && (
        <div className="glass-card profile-success-banner">
          <CheckCircle2 size={16} />
          Health profile saved successfully.
        </div>
      )}

      <div className="glass-card profile-completion-banner">
        <div className="profile-completion-top">
          <div>
            <h3>Profile completion</h3>
            <p>
              {completion === 100
                ? "Your health profile is fully complete."
                : "Fill in more details for better personalized insights."}
            </p>
          </div>

          <span className="profile-completion-percent">
            {completion}%
          </span>
        </div>

        <div className="profile-completion-track">
          <div
            className="profile-completion-fill"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {mode === "view" && !profile && (
        <div className="glass-card profile-setup-card">
          <div className="profile-setup-icon">
            <UserRound size={26} />
          </div>

          <h2>Set up your health profile</h2>

          <p>
            Add your age, lifestyle, medical history and
            emergency contact to unlock personalized
            wellness insights across your dashboard.
          </p>

          <button
            type="button"
            className="profile-edit-button"
            onClick={startEdit}
          >
            <Pencil size={14} />
            Set up profile
          </button>
        </div>
      )}

      {mode === "view" && profile && (
        <ViewSections
          profile={profile}
          onEdit={startEdit}
        />
      )}

      {mode === "edit" && (
        <form
          className="profile-page"
          onSubmit={handleSubmit}
        >
          {saveError && (
            <div className="glass-card profile-error-banner">
              <AlertTriangle size={16} />
              {saveError}
            </div>
          )}

          <EditSections
            form={form}
            errors={errors}
            updateField={updateField}
          />

          <div className="glass-card profile-section profile-actions-bar">
            <button
              type="button"
              className="profile-cancel-button"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default HealthProfile;
