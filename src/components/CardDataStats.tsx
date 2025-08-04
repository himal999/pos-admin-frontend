import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardDataStatsProps {
  title: string;
  total: string;
  children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  children,
}) => {
  return (
    <div className="flex items-center rounded-xl border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <motion.div
        className="flex h-11.5 w-11.5 items-center justify-center"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        {children}
      </motion.div>
      <div className="ml-4">
        <h4 className="text-title-md font-bold text-black dark:text-white">
          {total}
        </h4>
        <span className="text-sm font-medium">{title}</span>
      </div>
    </div>
  );
};

export default CardDataStats;
