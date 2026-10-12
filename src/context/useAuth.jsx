import { useContext } from "react"
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
    const data = useContext(AuthContext);
    return data;
}