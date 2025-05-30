const fs = require('fs');

const iphones = [
    {
        name: "iPhone 14",
        filename: "iphone_imgs/iphone14.json"
    },
    {
        name: "iPhone 14 Pro",
        filename: "iphone_imgs/iphone14pro.json"
    },
    {
        name: "iPhone 13",
        filename: "iphone_imgs/iphone13.json"
    }
];

const features = [
    {
        f1: "6.1-inch Super Retina XDR",
        f2: "Vibrant display with stunning clarity and color accuracy.",
        f3: "A15 Bionic Chip",
        f4: "Lightning-fast performance for all your tasks.",
        f5: "Advanced Dual-Camera",
        f6: "Capture stunning photos with 12MP wide and ultra-wide lenses.",
        f7: "Crash Detection",
        f8: "Automatically alerts emergency services in case of a severe crash.",
        f9: "Emergency SOS via Satellite",
        f10: "Connect to emergency services even without cellular or Wi-Fi.",
        f11: "All-Day Battery Life",
        f12: "Up to 20 hours of video playback."
    }
];

iphones.forEach(iphone => {
    const data = {
        name: iphone.name,
        features: features
    };
    fs.writeFileSync(iphone.filename, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`${iphone.filename} has been created successfully.`);
});