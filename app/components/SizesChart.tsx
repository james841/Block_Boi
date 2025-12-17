"use client";

import { X } from "lucide-react";

type SizeChartModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SizeChartModal({ isOpen, onClose }: SizeChartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-5 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Size Guide</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
            aria-label="Close size chart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Size Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <th className="border border-blue-200 px-4 py-3 text-left font-semibold text-blue-900">Size</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">US</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">UK</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">EUR</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">China</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">Chest (cm)</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">Waist (cm)</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">Hips (cm)</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">Leg length (cm)</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">Neck (cm)</th>
                  <th className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">Sleeve (cm)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: "XXS", us: "30", uk: "30", eur: "40", china: "-", chest: "76-81.5", waist: "66", hips: "-", leg: "-", neck: "33-34", sleeve: "77-79" },
                  { size: "XS", us: "32", uk: "32", eur: "42", china: "160", chest: "84-86", waist: "68-71", hips: "< 88", leg: "< 82.5", neck: "33-34", sleeve: "80-81" },
                  { size: "S", us: "34", uk: "34", eur: "44", china: "165/88-90", chest: "89-94", waist: "73-79", hips: "88-96", leg: "82.5", neck: "36-37", sleeve: "82-84" },
                  { size: "S", us: "36", uk: "36", eur: "46", china: "165/88-90", chest: "89-94", waist: "73-79", hips: "88-96", leg: "82.5", neck: "36-37", sleeve: "82-84" },
                  { size: "M", us: "38", uk: "38", eur: "48", china: "170/96-98", chest: "96-102", waist: "81-86", hips: "96-104", leg: "83", neck: "38-39", sleeve: "85-86" },
                  { size: "M", us: "40", uk: "40", eur: "50", china: "170/96-98", chest: "96-102", waist: "81-86", hips: "96-104", leg: "83", neck: "38-39", sleeve: "85-86" },
                  { size: "L", us: "42", uk: "42", eur: "52", china: "175/108-110", chest: "107-112", waist: "91-97", hips: "104-112", leg: "83.5", neck: "40-42", sleeve: "87-89" },
                  { size: "L", us: "44", uk: "44", eur: "54", china: "175/108-110", chest: "107-112", waist: "91-97", hips: "104-112", leg: "83.5", neck: "40-42", sleeve: "87-89" },
                  { size: "XL", us: "46", uk: "46", eur: "56", china: "180/118-122", chest: "116-122", waist: "101-107", hips: "112-120", leg: "84", neck: "43-45", sleeve: "90-91" },
                  { size: "XXL", us: "48", uk: "48", eur: "58", china: "185/126-130", chest: "127-132", waist: "111-117", hips: "120-128", leg: "84.5", neck: "46-47", sleeve: "91-93" },
                  { size: "XXXL", us: "50", uk: "50", eur: "60", china: "-", chest: "137-140", waist: "127-132", hips: "128-136", leg: "85", neck: "48-49", sleeve: "93-94" },
                ].map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
                    <td className="border border-blue-200 px-4 py-3 font-semibold text-blue-900">{row.size}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.us}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.uk}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.eur}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.china}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.chest}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.waist}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.hips}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.leg}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.neck}</td>
                    <td className="border border-blue-200 px-4 py-3 text-center text-gray-700">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to Measure Section */}
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4">How to Measure</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-semibold text-blue-900 mb-2">1. NECK SIZE</h4>
                  <p className="text-gray-700 text-sm">Use the tape to measure around the base of your neck, where it meets your shoulders. Put a finger between your neck and the tape measure for a more loose fit collar.</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-semibold text-blue-900 mb-2">2. SLEEVE</h4>
                  <p className="text-gray-700 text-sm">Bend your elbow and put your hand on your hip. Ask your friend to measure from middle of back of your neck, around shoulder and elbow to wrist bone.</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-semibold text-blue-900 mb-2">3. CHEST WIDTH</h4>
                  <p className="text-gray-700 text-sm">This measurement should be taken beneath your armpits, around the widest part of your chest and shoulder blades. Make sure to keep the tape measure horizontal, and don't pull to tight or hold your breath while measuring.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-semibold text-blue-900 mb-2">4. WAIST</h4>
                  <p className="text-gray-700 text-sm">Put the tape around your natural waistline, which should be close to your bellybutton. Put one finger between the tape and your body before you measure.</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-semibold text-blue-900 mb-2">5. INSEAM (LEG LENGTH)</h4>
                  <p className="text-gray-700 text-sm">This is measured between your groin and your lower ankle. You might find that is most easily measured on a pair of pants that already suit you.</p>
                </div>

                <div className="flex justify-center mt-6">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <p className="text-blue-600 font-medium">Measurement Diagram</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}