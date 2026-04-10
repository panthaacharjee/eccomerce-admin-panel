import axios from "axios";


//Vercel
// const staticUrl = `https://eccomerce-server-three.vercel.app`; 
//Render
const staticUrl = `https://eccomerce-server.onrender.com`;
// const staticUrl = `http://localhost:4000`;
const Axios = axios.create({
  baseURL: `${staticUrl}/api/v1`,
});

export default Axios;
