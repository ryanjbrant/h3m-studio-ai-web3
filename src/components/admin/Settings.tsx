import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface SettingsSection {
  title: string;
  description: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'switch' | 'select';
    options?: string[];
    value: any;
  }[];
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsSection[]>([
    {
      title: 'Generation Settings',
      description: 'Configure AI model generation parameters and limits',
      fields: [
        {
          key: 'maxGenerationsPerUser',
          label: 'Max Generations Per User',
          type: 'number',
          value: 10
        },
        {
          key: 'generationTimeout',
          label: 'Generation Timeout (seconds)',
          type: 'number',
          value: 300
        },
        {
          key: 'defaultArtStyle',
          label: 'Default Art Style',
          type: 'select',
          options: ['realistic', 'cartoon', 'low-poly', 'sculpture'],
          value: 'realistic'
        }
      ]
    },
    {
      title: 'Storage Settings',
      description: 'Configure storage limits and cleanup policies',
      fields: [
        {
          key: 'maxStoragePerUser',
          label: 'Max Storage Per User (GB)',
          type: 'number',
          value: 5
        },
        {
          key: 'autoCleanup',
          label: 'Auto Cleanup Old Files',
          type: 'switch',
          value: true
        },
        {
          key: 'cleanupAge',
          label: 'Cleanup Age (days)',
          type: 'number',
          value: 30
        }
      ]
    }
  ]);

  const handleFieldChange = (sectionIndex: number, fieldIndex: number, value: any) => {
    const newSettings = [...settings];
    newSettings[sectionIndex].fields[fieldIndex].value = value;
    setSettings(newSettings);
  };

  const handleSave = async () => {
    // TODO: Implement settings save
    console.log('Saving settings:', settings);
  };

  const handleReset = () => {
    // TODO: Implement settings reset
    console.log('Resetting settings');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Configure your application settings and parameters.</p>
      </div>

      {settings.map((section, sectionIndex) => (
        <div key={section.title} className="bg-[#121214] border border-[#242429] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-2">{section.title}</h2>
          <p className="text-gray-400 mb-6">{section.description}</p>

          <div className="space-y-6">
            {section.fields.map((field, fieldIndex) => (
              <div key={field.key} className="flex items-center justify-between">
                <label className="text-sm font-medium">{field.label}</label>
                {field.type === 'switch' ? (
                  <button
                    onClick={() => handleFieldChange(sectionIndex, fieldIndex, !field.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      field.value ? 'bg-blue-500' : 'bg-[#242429]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        field.value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                ) : field.type === 'select' ? (
                  <select
                    value={field.value}
                    onChange={(e) => handleFieldChange(sectionIndex, fieldIndex, e.target.value)}
                    className="bg-[#0a0a0b] border border-[#242429] rounded-lg px-3 py-2"
                  >
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => handleFieldChange(
                      sectionIndex,
                      fieldIndex,
                      field.type === 'number' ? Number(e.target.value) : e.target.value
                    )}
                    className="bg-[#0a0a0b] border border-[#242429] rounded-lg px-3 py-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-[#242429] text-white rounded-lg hover:bg-[#2a2a2f] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}; 