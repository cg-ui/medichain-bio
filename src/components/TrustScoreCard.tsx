import React from 'react';

const doctors = [
  {
    id: 1,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOGRuapW-xDG1ebDn5YXuhiBCNsh_kTGWbJp_jFZjBKc0nzRY8kehrgrMba0Y5o7hpECqDbM1Ze-MH_v5eszA2GylKir4uGUENwMUtYmqEzDBIfd79U6a8BpO-2_TyRgl6-_dH9yLxpatxu_omftCgSoRvq7Oe-PmbOSp73PMHiiL21gdhF-881eUEIJPg7FjZh8Ak6uDeNyDKFUgLgVcG1MbCXnRUFsIwXUhfX4uQSG-_Ntpd6BJ3S3wLk7XIi5WZuPWac5yudoR4"
  },
  {
    id: 2,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxb3sA5OhZwoIM0-cpBS36nAp4CyYZ_1fyOWKjUkvmGoHgf-yhWeEtNSP7a9WbAKG-_5biZ6h2PyQAkXU813sX2-qiRJU86n8QEyuq5YfgwMQlBs50gTvePQAl3Vi2WLVx6Zed1gWP3Y4xEAj_922I-93c_JZPRAq85TGakNmqphkVrK39_oPXxNr6ZS1zoE-MqX4vjcqopX567YC1fGPNy41X1YNSTHl79egJkxI6P_CSUFp2N7ecWaFRSgcDW5D0Al8apJBa21_k"
  }
];

export function TrustScoreCard() {
  return (
    <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-primary to-primary-container text-white overflow-hidden relative">
      <div className="relative z-10">
        <h4 className="text-lg font-headline font-extrabold mb-2">Trust Score: 98.2</h4>
        <p className="text-xs opacity-80 mb-6 leading-relaxed">
          Your medical records are synchronized across 12 distributed nodes with zero integrity failures.
        </p>
        <div className="flex items-center">
          <div className="flex -space-x-2 mr-3">
            {doctors.map((doc) => (
              <div 
                key={doc.id}
                className="w-8 h-8 rounded-full border-2 border-white/30 bg-surface-container-lowest overflow-hidden"
              >
                <img 
                  src={doc.img} 
                  alt="Doctor" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white/30 bg-white/20 flex items-center justify-center text-[10px] font-bold">
              +10
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
    </div>
  );
}
