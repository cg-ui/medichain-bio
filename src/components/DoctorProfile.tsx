import React, { useState, useEffect } from 'react';
import { ShieldCheck, Watch, Smartphone, RefreshCw, Plus, Lock, Info, Clock, CheckCircle2, Activity, Edit3, Copy, Check, AlertTriangle, Loader2, Stethoscope, Award, Building, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { toast } from 'sonner';

const certifications = [
  {
    id: 'md-001',
    title: 'Medical Doctor (MD)',
    issuer: 'American Board of Internal Medicine',
    issueDate: '2018-06-15',
    expiryDate: '2028-06-15',
    status: 'Active',
    credentialId: 'ABI-2018-00492'
  },
  {
    id: 'board-cert-001',
    title: 'Board Certified - Internal Medicine',
    issuer: 'American Board of Internal Medicine',
    issueDate: '2019-03-22',
    expiryDate: '2029-03-22',
    status: 'Active',
    credentialId: 'BCIM-2019-00123'
  },
  {
    id: 'dea-001',
    title: 'DEA Registration',
    issuer: 'Drug Enforcement Administration',
    issueDate: '2018-09-01',
    expiryDate: '2024-09-01',
    status: 'Active',
    credentialId: 'DEA-123456789'
  }
];

const specializations = [
  'Internal Medicine',
  'Cardiology',
  'Emergency Medicine',
  'Family Medicine'
];

const activityLog = [
  {
    date: '2024-01-15 14:30',
    action: 'Granted emergency access to patient Eleanor Shellstrop',
    type: 'emergency',
    hash: '0x8a2...3f1'
  },
  {
    date: '2024-01-14 09:15',
    action: 'Reviewed patient records for Chidi Anagonye',
    type: 'access',
    hash: '0x7b1...2e4'
  },
  {
    date: '2024-01-13 16:45',
    action: 'Updated access permissions for Tahani Al-Jamil',
    type: 'permission',
    hash: '0x3c2...1a9'
  },
  {
    date: '2024-01-12 11:20',
    action: 'Logged into MediChain system',
    type: 'login',
    hash: '0x9d3...5g2'
  }
];

export function DoctorProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Johnson',
    email: user?.email || 'dr.johnson@medichain.com',
    phone: '+1 (555) 123-4567',
    license: 'MD-123456789',
    hospital: 'Central Medical Center',
    department: 'Internal Medicine',
    address: '123 Medical Drive, Healthcare City, HC 12345',
    yearsExperience: '8',
    specializations: ['Internal Medicine', 'Cardiology'],
    bio: 'Board-certified internal medicine physician with 8 years of experience in patient care and medical record management. Committed to providing secure, blockchain-verified healthcare services.'
  });

  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = async (text: string, hash: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(hash);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-1">
              Doctor Profile
            </h1>
            <p className="text-outline font-medium">Manage your professional credentials and preferences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Wallet Address */}
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-outline font-medium">Wallet Address</p>
                <p className="font-mono text-sm text-on-surface">
                  {user?.walletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}
                </p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(user?.walletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'wallet')}
              className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
            >
              {copiedHash === 'wallet' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-outline" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Information */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Professional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-outline mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/20 rounded-lg focus:border-primary focus:outline-none"
                  />
                ) : (
                  <p className="text-on-surface font-medium">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-outline mb-2">Medical License</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.license}
                    onChange={(e) => setProfile({...profile, license: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/20 rounded-lg focus:border-primary focus:outline-none"
                  />
                ) : (
                  <p className="text-on-surface font-medium">{profile.license}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-outline mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/20 rounded-lg focus:border-primary focus:outline-none"
                  />
                ) : (
                  <p className="text-on-surface">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-outline mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/20 rounded-lg focus:border-primary focus:outline-none"
                  />
                ) : (
                  <p className="text-on-surface">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-outline mb-2">Hospital/Institution</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.hospital}
                    onChange={(e) => setProfile({...profile, hospital: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/20 rounded-lg focus:border-primary focus:outline-none"
                  />
                ) : (
                  <p className="text-on-surface">{profile.hospital}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-outline mb-2">Department</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/20 rounded-lg focus:border-primary focus:outline-none"
                  />
                ) : (
                  <p className="text-on-surface">{profile.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-outline mb-2">Years of Experience</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.yearsExperience}
                    onChange={(e) => setProfile({...profile, yearsExperience: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/20 rounded-lg focus:border-primary focus:outline-none"
                  />
                ) : (
                  <p className="text-on-surface">{profile.yearsExperience} years</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-outline mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/20 rounded-lg focus:border-primary focus:outline-none"
                  />
                ) : (
                  <p className="text-on-surface">{profile.address}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-surface-container-high text-on-surface rounded-lg font-medium hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Specializations */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Specializations
            </h2>

            <div className="flex flex-wrap gap-2">
              {profile.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Professional Bio */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-on-surface mb-4">Professional Bio</h2>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 bg-surface border border-outline-variant/20 rounded-lg focus:border-primary focus:outline-none"
                placeholder="Describe your professional background and expertise..."
              />
            ) : (
              <p className="text-on-surface leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Certifications */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/20">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Certifications
            </h3>

            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-4 bg-surface border border-outline-variant/20 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-on-surface text-sm">{cert.title}</h4>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      cert.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {cert.status}
                    </span>
                  </div>
                  <p className="text-outline text-xs mb-1">{cert.issuer}</p>
                  <p className="text-outline text-xs">ID: {cert.credentialId}</p>
                  <p className="text-outline text-xs">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/20">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityLog.map((activity, index) => (
                <div key={index} className="p-3 bg-surface border border-outline-variant/20 rounded-lg">
                  <p className="text-on-surface text-sm mb-1">{activity.action}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-outline text-xs">{activity.date}</p>
                    <button
                      onClick={() => copyToClipboard(activity.hash, activity.hash)}
                      className="text-outline hover:text-primary transition-colors"
                    >
                      {copiedHash === activity.hash ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}