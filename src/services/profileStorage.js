const PROFILE_KEY = 'studypilot_profile';

export function getProfile() {
  try {
    const savedProfile = localStorage.getItem(PROFILE_KEY);

    if (!savedProfile) {
      return null;
    }

    const profile = JSON.parse(savedProfile);

    if (!profile || typeof profile !== 'object' || !profile.name) {
      return null;
    }

    return profile;
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}