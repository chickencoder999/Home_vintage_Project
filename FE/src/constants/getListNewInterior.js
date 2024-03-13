import axios from "axios";

export const getListNewInterior = async () => {
  const res = await axios.get(
    `https://home-vintage-backend.onrender.com/interiors`
  );
  return res.data;
};
