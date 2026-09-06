import React from "react";
import { useNavigate } from "react-router";
import Button from "../src/components/Button/Button";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <img src="/images/not-found.svg" alt="Not Found" className="w-full" />
      <div className="p-4 text-center space-y-8">
        <h4 className="text-xl text-gray-700 font-medium mt-4 dark:text-white">
          صفحه مورد نظر یافت نشد!
        </h4>
        <Button variant="primary" onClick={() => navigate("/home")}>
          برگشت به خانه
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
