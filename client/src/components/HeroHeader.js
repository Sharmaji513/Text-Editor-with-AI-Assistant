import React from 'react';
import { motion } from 'framer-motion';

function HeroHeader({ title, subtitle, right }) {
  return (
    <div style={{ position: 'relative', marginBottom: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass"
        style={{ padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <h2 className="gradient-text" style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{title}</h2>
          {subtitle && (
            <div style={{ opacity: 0.8, marginTop: 6 }}>{subtitle}</div>
          )}
        </div>
        {right}
      </motion.div>
    </div>
  );
}

export default HeroHeader;


