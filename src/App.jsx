import React, { useState, useRef } from "react";
import QrScanner from "qr-scanner";
import {
  Scan,
  Home,
  QrCode,
  ArrowLeft,
  Check,
  Wallet,
  Clock,
} from "lucide-react";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [scannedData, setScannedData] = useState(null);
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [showDebitDetails, setShowDebitDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrScanner, setQrScanner] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const demoQRCodes = [
    { id: 1, name: "Starbucks Coffee", upi: "starbucks@paytm" },
    { id: 2, name: "Local Store", upi: "localstore@okaxis" },
    { id: 3, name: "Restaurant XYZ", upi: "restaurant@ybl" },
  ];

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, name: "John Doe", amount: 500, time: "2 hours ago", date: "2024-01-15", upiId: "johndoe@paytm", type: "sent" },
    { id: 2, name: "Coffee Shop", amount: 250, time: "Yesterday", date: "2024-01-14", upiId: "coffee@paytm", type: "sent" },
    { id: 3, name: "Grocery Store", amount: 1200, time: "2 days ago", date: "2024-01-13", upiId: "grocery@okaxis", type: "sent" },
  ]);

  const handleScanQR = () => {
    setCurrentPage("scan");
  };

  const startCameraScan = async () => {
    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          const upiData = parseUPI(result.data);
          if (upiData) {
            setScannedData(upiData);
            scanner.stop();
            setCurrentPage("enter-amount");
          } else {
            alert("Invalid QR code. Please scan a valid UPI payment QR code.");
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      await scanner.start();
      setQrScanner(scanner);
    } catch (error) {
      console.error("Error starting camera:", error);
      alert("Failed to access camera. Please upload a QR image instead.");
      fileInputRef.current?.click();
    }
  };

  const stopCameraScan = () => {
    if (qrScanner) {
      qrScanner.stop();
      setQrScanner(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const result = await QrScanner.scanImage(file);
        const upiData = parseUPI(result);
        if (upiData) {
          setScannedData(upiData);
          setCurrentPage("enter-amount");
        } else {
          alert("Invalid QR code. Please scan a valid UPI payment QR code.");
        }
      } catch (error) {
        console.error("Error scanning QR code:", error);
        alert("Failed to scan QR code. Please try again.");
      }
    }
  };

  const parseUPI = (upiString) => {
    if (!upiString.startsWith("upi://pay?")) {
      return null;
    }

    const url = new URL(upiString);
    const params = new URLSearchParams(url.search);

    const pa = params.get("pa"); // Payee address (UPI ID)
    const pn = params.get("pn"); // Payee name

    if (!pa) {
      return null;
    }

    return {
      name: pn || "Unknown Merchant",
      upi: pa,
    };
  };

  const handleQuickPay = (merchant) => {
    setScannedData(merchant);
    setCurrentPage("enter-amount");
  };

  const handlePayment = () => {
    if (amount && parseFloat(amount) > 0) {
      setIsProcessing(true);
      const txnId = "TXN" + Date.now().toString().slice(-10);
      setTransactionId(txnId);
      setShowDebitDetails(true);

      // Show success page after 1.5 seconds
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentPage("success");

        // Add to recent transactions
        const newTransaction = {
          id: Date.now(),
          name: scannedData?.name || "Unknown Merchant",
          amount: parseFloat(amount),
          time: "Just now",
          date: new Date().toISOString().split('T')[0],
          upiId: scannedData?.upi || "unknown@upi",
          type: "sent",
          txnId: txnId,
          timestamp: new Date().toISOString(),
          senderUpi: "ashimraj@indusind",
          senderName: "Ashim Raj",
          bank: "IndusInd Bank"
        };
        setRecentTransactions(prev => [newTransaction, ...prev.slice(0, 9)]); // Keep only last 10
      }, 1500);
    }
  };

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">BHIM UPI</h1>
            <p className="text-sm text-white/80">Ashim Raj • ashimraj@indusind</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Wallet size={20} />
            <span className="font-semibold">₹10,000</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setCurrentPage("scan")}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Scan className="text-purple-600" size={32} />
            </div>
            <p className="text-gray-800 font-semibold text-center">Scan QR</p>
          </button>

          <button
            onClick={() => setCurrentPage("qr-code")}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <QrCode className="text-blue-600" size={32} />
            </div>
            <p className="text-gray-800 font-semibold text-center">My QR</p>
          </button>
        </div>

        {/* Quick Pay */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Pay</h2>
          <div className="space-y-3">
            {demoQRCodes.map((merchant) => (
              <button
                key={merchant.id}
                onClick={() => handleQuickPay(merchant)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                    {merchant.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">
                      {merchant.name}
                    </p>
                    <p className="text-sm text-gray-500">{merchant.upi}</p>
                  </div>
                </div>
                <div className="text-purple-600">→</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {recentTransactions.map((txn) => (
              <div
                key={txn.id}
                onClick={() => setSelectedTransaction(txn)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    txn.type === 'sent' ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {txn.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{txn.name}</p>
                    <p className="text-sm text-gray-500">{txn.upiId}</p>
                    <p className="text-xs text-gray-400">{txn.time} • {txn.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${txn.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                    {txn.type === 'sent' ? '-' : '+'}₹{txn.amount}
                  </p>
                  <p className="text-xs text-gray-400 uppercase">{txn.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderScanPage = () => (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6">
        <button
          onClick={() => {
            stopCameraScan();
            setCurrentPage("home");
          }}
          className="flex items-center gap-2 text-white mb-6"
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Scan QR Code</h2>
          <p className="text-gray-400 mb-8">
            Position the QR code within the frame
          </p>

          <div className="relative mx-auto w-80 h-80 bg-black/50 rounded-3xl border-4 border-white/30 overflow-hidden mb-8">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-2xl"
              playsInline
              muted
            />
            <div className="absolute inset-4 border-4 border-purple-500 rounded-2xl animate-pulse pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Scan size={64} className="text-white/50" />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex gap-4 justify-center">
            <button
              onClick={startCameraScan}
              className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-all"
            >
              Start Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all"
            >
              Upload QR Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQRCodePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="p-6">
        <button
          onClick={() => setCurrentPage("home")}
          className="flex items-center gap-2 text-white mb-6"
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-3xl p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Receive Money
          </h2>
          <p className="text-gray-600 mb-6 text-center">Show this QR code to receive payment</p>

          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-2xl mb-6">
            <div className="bg-white p-6 rounded-xl">
              <QrCode size={200} className="mx-auto text-gray-800" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">ashimraj@indusind</p>
            <p className="text-sm text-gray-600">UPI ID</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnterAmountPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="p-6">
        <button
          onClick={() => setCurrentPage("home")}
          className="flex items-center gap-2 text-white mb-6"
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-3xl p-8 max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
              {scannedData?.name?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Pay {scannedData?.name}
            </h2>
            <p className="text-sm text-gray-600">{scannedData?.upi}</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Enter Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-4 text-3xl font-bold border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className="py-3 bg-gray-100 rounded-lg font-semibold text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-all"
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <button
            onClick={handlePayment}
            disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Check size={48} className="text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Payment Successful
        </h2>
        <p className="text-gray-600 mb-8">Money sent successfully</p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                {scannedData?.name?.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">{scannedData?.name}</p>
                <p className="text-sm text-gray-500">{scannedData?.upi}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">-₹{amount}</p>
              <p className="text-xs text-gray-400 uppercase">sent</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID</span>
              <span className="text-sm font-mono text-gray-800">{transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="text-sm text-gray-800">
                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">From Account</span>
              <div className="text-right">
                <p className="font-semibold text-gray-800">Ashim Raj</p>
                <p className="text-sm text-gray-500">ashimraj@indusind</p>
                <p className="text-xs text-gray-400">IndusInd Bank</p>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reference</span>
              <span className="text-sm text-gray-800">UPI Payment</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage("home")}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );

  const renderTransactionDetailsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="p-6">
        <button
          onClick={() => setSelectedTransaction(null)}
          className="flex items-center gap-2 text-white mb-6"
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-3xl p-8 max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold ${
              selectedTransaction?.type === 'sent' ? 'bg-red-500' : 'bg-green-500'
            }`}>
              {selectedTransaction?.name?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {selectedTransaction?.type === 'sent' ? 'Money Sent' : 'Money Received'}
            </h2>
            <p className="text-sm text-gray-600">{selectedTransaction?.name}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <span className={`text-2xl font-bold ${
                selectedTransaction?.type === 'sent' ? 'text-red-600' : 'text-green-600'
              }`}>
                {selectedTransaction?.type === 'sent' ? '-' : '+'}₹{selectedTransaction?.amount}
              </span>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="text-sm font-mono text-gray-800">{selectedTransaction?.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time</span>
                <span className="text-sm text-gray-800">
                  {selectedTransaction?.timestamp ? new Date(selectedTransaction.timestamp).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UPI ID</span>
                <span className="text-sm text-gray-800">{selectedTransaction?.upiId}</span>
              </div>
              {selectedTransaction?.type === 'sent' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">From</span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{selectedTransaction?.senderName}</p>
                      <p className="text-sm text-gray-500">{selectedTransaction?.senderUpi}</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank</span>
                    <span className="font-semibold text-gray-800">{selectedTransaction?.bank}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="text-sm font-semibold text-green-600">SUCCESSFUL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      {selectedTransaction ? renderTransactionDetailsPage() : (
        <>
          {currentPage === "home" && renderHomePage()}
          {currentPage === "scan" && renderScanPage()}
          {currentPage === "qr-code" && renderQRCodePage()}
          {currentPage === "enter-amount" && renderEnterAmountPage()}
          {currentPage === "success" && renderSuccessPage()}
        </>
      )}
    </div>
  );
}
