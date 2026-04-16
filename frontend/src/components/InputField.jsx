import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";

const InputField = ({ label, type, placeholder, value, onChange, error, isUpdating }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full space-y-2 text-left">
      <label className="text-[14px] font-bold text-gray-900 ml-1">{label}</label>
      <div className="relative flex items-center">
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          disabled={isUpdating}
          placeholder={placeholder}
          className={`w-full px-5 pr-12 py-3.5 bg-white border-2 rounded-2xl outline-none transition-all duration-200
            ${error 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 p-1 text-gray-400 hover:text-indigo-600 transition-colors z-10 bg-white"
          >
            {show ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;