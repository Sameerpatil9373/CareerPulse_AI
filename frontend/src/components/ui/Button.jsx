const Button = ({ children, onClick, variant = "primary", icon: Icon, disabled, className = "" }) => {
  const baseClass = "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50";
  const variants = {
    primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700",
    outline: "bg-white border border-gray-100 text-indigo-600 shadow-sm hover:shadow-md",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};
export default Button;