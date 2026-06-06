export const extractTextFromPDF = async (file: File): Promise<string> => {
  // For the hackathon demo, we'll simulate PDF extraction delay
  // and return a hardcoded 'Hostel Rules' document text.
  // In a real app, you would use pdfjs-dist here.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
        HOSTEL RULES AND REGULATIONS:
        1. Timings: Students must return to the hostel by 10:00 PM.
        2. Visitors: No visitors are allowed in the rooms after 8:00 PM.
        3. Electrical Appliances: Iron boxes, heaters, and kettles are strictly prohibited.
        4. Pets: Keeping pets of any kind (dogs, cats, birds, fish, etc.) is strictly prohibited in the hostel premises.
        5. Cleanliness: Students must keep their rooms and common areas clean.
        6. Damage: Any damage to hostel property will be fined.
      `);
    }, 1500);
  });
};
