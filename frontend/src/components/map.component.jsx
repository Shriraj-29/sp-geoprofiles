import { useEffect, useState } from "react";
import mapboxgl from "";
import axios from "axios";

const Map = ({ address }) => {
  let { address_line_1, address_line_2, city, postal_code, state, country } =
    address;

  let addressString1 = `${address_line_1}, ${address_line_2}, ${city}, ${state}, ${postal_code}, ${country}`;

  let addressString =
    "Amit Astonia Royale, Bangalore Highway, Ambegaon Budruk, Pune, Maharashtra 411046";

  let apiKey = "AIzaSyDAXCvGvy9u8_aBg7gJfqSKyw_C9K0-7fI";

  let [center, setCenter] = useState({ lat: 18.5204, lng: 73.8567 }); // Default center

  let Marker = ({ text }) => {
    <div style={{ color: "red" }}>{text}</div>;
  };

  useEffect(() => {
    // Fetch coordinates using Google Maps Geocoding API
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            addressString
          )}&key=${apiKey}`
        );
        const result = response.data.results[0];
        if (result) {
          const { lat, lng } = result.geometry.location;
          setCenter({ lat, lng });
        } else {
          console.error("No results found for the address.");
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      }
    };

    // Call fetchData when component mounts
    fetchData();
  }, [address, apiKey]);

  return <div style={{ height: "400px", width: "100%" }}></div>;
};

export default Map;
