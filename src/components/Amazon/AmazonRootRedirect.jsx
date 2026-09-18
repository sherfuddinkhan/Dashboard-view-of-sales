import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AmazonRootRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken") || localStorage.getItem("accessToken");
    if (!token) {
      navigate("/marketplaces/amazon/auth/token", { replace: true });
    } else {
      navigate("/marketplaces/amazon/sellers", { replace: true });
    }
  }, [navigate]);
  return <div style={{padding:30}}>Checking Amazon Token... Redirecting to Generate Token → Sellerlist...</div>;
};
export default AmazonRootRedirect;