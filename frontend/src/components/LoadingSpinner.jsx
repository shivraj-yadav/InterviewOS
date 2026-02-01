import { Sparkles, Brain, Code2 } from "lucide-react";
import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative">
        {/* Animated background circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-32 h-32 border-4 border-purple-500/20 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-24 h-24 border-4 border-blue-500/30 rounded-full"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>

        {/* Central animated icons */}
        <div className="relative flex items-center justify-center space-x-2">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>
          
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Brain className="w-8 h-8 text-pink-400" />
          </motion.div>
          
          <motion.div
            animate={{
              rotate: [0, -360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 1,
            }}
          >
            <Code2 className="w-8 h-8 text-blue-400" />
          </motion.div>
        </div>

        {/* Loading text */}
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="text-center">
            <p className="text-white text-lg font-semibold mb-2">Talent IQ</p>
            <div className="flex space-x-1 justify-center">
              <motion.div
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: 0,
                }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: 0.2,
                }}
              />
              <motion.div
                className="w-2 h-2 bg-pink-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: 0.4,
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
