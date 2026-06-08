/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enquiry, Student, InstituteSettings } from './types';

export const DEFAULT_SETTINGS: InstituteSettings = {
  instituteName: "DIPs Computers",
  logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&h=150&fit=crop&q=80", // Premium study space/notebook style
  receiptLogo: "",
  ownerName: "DIPAK PATIL",
  email: "dipscomputers@gmail.com",
  website: "www.dipscomputers.in",
  mobile1: "9049102035",
  mobile2: "8888732035",
  address: "Near Bank of Maharashtra, Yeole Complex, Shirpur Jain, Tq. Malegaon, Dist. Washim - 444504",
  themeColor: "blue",
  whatsAppTemplate: `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

आज *दिप्स कॉम्प्युटर्स* सेंटरला भेट देऊन *[कोर्सचे नाव]*  या कोर्सच्या चौकशीसाठी आल्याबद्दल तुमचे मनःपूर्वक धन्यवाद!

तुम्हाला या कोर्सबद्दल दिलेली सर्व माहिती आणि बॅचच्या वेळा व्यवस्थित समजल्या असतील अशी आशा आहे. तुमचा प्रवेश निश्चित करण्यासाठी किंवा तुमच्या मनात अजून काही शंका असल्यास, तुम्ही याच नंबरवर मेसेज किंवा कॉल करून नक्की विचारू शकता.

लवकरात लवकर आपला प्रवेश निश्चित करा आणि तुमच्या उज्ज्वल करिअरची सुरुवात करा! ✨

📍 *आमचा पत्ता:*
बँक ऑफ महाराष्ट्रच्या मागे,
येवले कॉम्प्लेक्स, शिरपूर जैन,
ता. मालेगाव जि. वाशिम 444504

🌐 वेबसाईट: www.dipscomputers.in

📞 संपर्क:
👨🏼💼*दिपक मा. खंदारे (पाटील)*
📲 9049102035 / 8888732035

*धन्यवाद.* 🙏`,
  whatsAppAdmissionTemplate: `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

मनापासून अभिनंदन! ✨

*दिप्स कॉम्प्युटर्स* मध्ये *[कोर्सचे नाव]* या कोर्ससाठी तुमचा प्रवेश यशस्वीरीत्या निश्चित झाला आहे. 🎓

आम्हाला अत्यंत आनंद आहे की तुम्ही तुमच्या उज्ज्वल भविष्यासाठी आणि तंत्रज्ञानाच्या प्रवासासाठी आमची निवड केली. आम्ही तुम्हाला सर्वोत्तम शिक्षण आणि मार्गदर्शन देण्यास कटिबद्ध आहोत.

📅 *बॅचच्या वेळेबद्दल* आणि इतर माहितीसाठी कृपया सेंटरशी संपर्क साधा किंवा उद्यापासून ठरलेल्या वेळेत बॅचला उपस्थित रहा.

📍 *पत्ता:*
बँक ऑफ महाराष्ट्रच्या मागे,
येवले कॉम्प्लेक्स, शिरपूर जैन,
ता. मालेगाव जि. वाशिम 444504

🌐 वेबसाईट: www.dipscomputers.in

📞 संपर्क:
👨🏼💼*दिपक मा. खंदारे (पाटील)*
📲 9049102035 / 8888732035

*तुमच्यापुढील शैक्षणिक वाटचालीस हार्दिक शुभेच्छा!* 🚀`,
  whatsAppReminderTemplate: `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

हा *दिप्स कॉम्प्युटर्स* कडून एक नम्र आठवण संदेश आहे. 💡

तुमच्या *[कोर्सचे नाव]* या कोर्सची थकीत फी *₹[थकीत रक्कम]* जमा करणे प्रलंबित आहे.

कृपया आपल्या सोयीनुसार लवकरात लवकर सदर शुल्क फी जमा करावी जेणेकरून तुमचा अभ्यासक्रम विनाअडथळा सुरू राहील.

मदत किंवा अधिक माहितीसाठी संपर्क साधू शकता.

📍 पत्ता: बँक ऑफ महाराष्ट्रच्या मागे, येवले कॉम्प्लेक्स, शिरपूर जैन.

📞 संपर्क: 9049102035 / 8888732035
*धन्यवाद!* 😊`,
  whatsAppReceiptTemplate: `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

तुमचे *दिप्स कॉम्प्युटर्स* मध्ये शुल्क यशस्वीरीत्या जमा केल्याबद्दल मनःपूर्वक धन्यवाद! 🧾✨

*फी पावती तपशील:*
----------------------------------
👤 विद्यार्थी: *[विद्यार्थ्याचे नाव]*
🎓 कोर्स: *[कोर्सचे नाव]*
💵 जमा तारीख: *[जमा तारीख]*
🔢 पावती क्रमांक: *[पावती क्रमांक]*
💰 जमा रक्कम: *₹[भरलेली रक्कम]*
Remaining थकीत रक्कम (Balance): *₹[शिल्लक रक्कम]*
----------------------------------

📍 पत्ता: बँक ऑफ महाराष्ट्रच्या मागे, येवले कॉम्प्लेक्स, शिरपूर जैन.
📞 संपर्क: 9049102035 / 8888732035

*तुमच्या उज्ज्वल भविष्यासाठी शुभेच्छा!* 🚀`
};

export const DEFAULT_ENQUIRIES: Enquiry[] = [
  {
    id: "enq-101",
    fullName: "Amit Shrikrishna Joshi",
    mobile: "9876543210",
    village: "Shirpur Jain",
    course: "MS-CIT",
    referralName: "Rahul Patil",
    enquiryDate: "2026-06-01",
    status: "pending",
    notes: "Interested in morning batch starting next week."
  },
  {
    id: "enq-102",
    fullName: "Prajakta Ramesh Chavan",
    mobile: "9421034567",
    village: "Malegaon",
    course: "Tally GST",
    referralName: "Self",
    enquiryDate: "2026-06-03",
    status: "pending",
    notes: "Needs installment option."
  },
  {
    id: "enq-103",
    fullName: "Sushant Sanjay Deshmukh",
    mobile: "8308456712",
    village: "Kenwad",
    course: "Advanced Excel",
    referralName: "Ganesh Sir",
    enquiryDate: "2026-06-04",
    status: "pending",
    notes: "Enquired about Advanced Excel syllabus & projects."
  },
  {
    id: "enq-104",
    fullName: "Rohit Tukaram Patil",
    mobile: "7057342155",
    village: "Washim",
    course: "Basic Computer",
    referralName: "Amit Joshi",
    enquiryDate: "2026-05-28",
    status: "converted",
    notes: "Confirmed seat, converted to admission."
  },
  {
    id: "enq-105",
    fullName: "Snehal Ankush Gawande",
    mobile: "9156412356",
    village: "Ansing",
    course: "DTP",
    referralName: "Facebook post",
    enquiryDate: "2026-06-02",
    status: "pending",
    notes: "Wants to join with standard desktop publishing tools. Already has basic knowledge."
  }
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: "stud-269",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80",
    fullName: "DIPAK PATIL",
    mobile: "9049102035",
    dob: "1993-08-20",
    village: "Shirpur Jain",
    course: "MS-CIT",
    referralName: "Dipak Sir",
    admissionDate: "2026-05-15",
    totalFees: 5000,
    paidAmount: 3000,
    balanceFees: 2000,
    installments: [
      {
        installmentNo: 1,
        amount: 1500,
        paymentDate: "2026-05-15",
        receiptNo: "RC-2026-001",
        paymentMethod: "Cash"
      },
      {
        installmentNo: 2,
        amount: 1500,
        paymentDate: "2026-06-01",
        receiptNo: "RC-2026-014",
        paymentMethod: "UPI"
      }
    ]
  },
  {
    id: "stud-202",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80",
    fullName: "Aditya Vinayak Rao",
    mobile: "8888732035",
    dob: "2004-12-05",
    village: "Malegaon",
    course: "Tally GST",
    referralName: "Prof. G. S. Kale",
    admissionDate: "2026-04-10",
    totalFees: 6000,
    paidAmount: 6000,
    balanceFees: 0,
    installments: [
      {
        installmentNo: 1,
        amount: 2000,
        paymentDate: "2026-04-10",
        receiptNo: "RC-2026-002",
        paymentMethod: "UPI"
      },
      {
        installmentNo: 2,
        amount: 4000,
        paymentDate: "2026-05-10",
        receiptNo: "RC-2026-009",
        paymentMethod: "NetBanking"
      }
    ]
  },
  {
    id: "stud-203",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&q=80",
    fullName: "Vrushali Santosh Deshmukh",
    mobile: "7769012345",
    dob: "2006-03-22",
    village: "Shirpur Jain",
    course: "Basic Computer",
    referralName: "Self",
    admissionDate: "2026-05-20",
    totalFees: 3500,
    paidAmount: 1500,
    balanceFees: 2000,
    installments: [
      {
        installmentNo: 1,
        amount: 1500,
        paymentDate: "2026-05-20",
        receiptNo: "RC-2026-005",
        paymentMethod: "Cash"
      }
    ]
  },
  {
    id: "stud-204",
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&q=80",
    fullName: "Harshvardhan Vijay Ghuge",
    mobile: "9021456578",
    dob: "2005-01-10",
    village: "Washim",
    course: "Advanced Excel",
    referralName: "Sanjay Ghuge",
    admissionDate: "2026-05-25",
    totalFees: 4500,
    paidAmount: 4500,
    balanceFees: 0,
    installments: [
      {
        installmentNo: 1,
        amount: 4500,
        paymentDate: "2026-05-25",
        receiptNo: "RC-2026-008",
        paymentMethod: "UPI"
      }
    ]
  },
  {
    id: "stud-205",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80",
    fullName: "Shital Devidas Patil",
    mobile: "9422890566",
    dob: "2004-06-18",
    village: "Kenwad",
    course: "DTP",
    referralName: "DIPs Alumni",
    admissionDate: "2026-05-30",
    totalFees: 4000,
    paidAmount: 2000,
    balanceFees: 2000,
    installments: [
      {
        installmentNo: 1,
        amount: 2000,
        paymentDate: "2026-05-30",
        receiptNo: "RC-2026-012",
        paymentMethod: "Cash"
      }
    ]
  }
];
