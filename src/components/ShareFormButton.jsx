import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Share2, Copy, QrCode, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareFormButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const formUrl = `${window.location.origin}/StudentForm`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const generateQRCode = () => {
    // Using a free QR code API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(formUrl)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        className="border-indigo-500 text-indigo-600"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Form
      </Button>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowDialog(false)}>
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                Share Student Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-3">
                  Share this link with students to fill out the Student Data Collection Form
                </p>
                <div className="flex gap-2">
                  <Input
                    value={formUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generateQRCode}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
                <Button
                  onClick={() => setShowDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 Students can access this form without logging in. Share via Google Classroom, email, or print the QR code.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}