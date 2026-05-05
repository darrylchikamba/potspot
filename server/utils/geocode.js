export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'PotSpot/1.0'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data && data.display_name) {
      // Split by comma and trim parts
      const parts = data.display_name.split(',').map(part => part.trim());
      // Take the first 3 components for a short, human-readable address
      const shortAddress = parts.slice(0, 3).join(', ');
      return shortAddress;
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    return null;
  }
};
