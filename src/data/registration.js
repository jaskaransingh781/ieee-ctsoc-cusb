// ---------------------------------------------------------------------------
// CHAPTER REGISTRATION FORM
// The IEEE CTSoc CUSB Chapter interest form. Every field, option and message
// is defined here; the form component only draws what this file describes.
// To add a department, an interest or a field, edit the lists below.
//
// The same checks run again on the server (server/contact.js). If you
// change a rule here (the email domain, for example), change it there too.
// ---------------------------------------------------------------------------

export const registrationCopy = {
  title: 'Get involved with IEEE CTSoc CUSB',
  subtitle:
    'Share your student details and interests. The IEEE CTSoc CUSB Chapter team will reach out with next steps.',
  formName: 'IEEE CTSoc CUSB Chapter interest form',
  submit: 'Send details',
  consent:
    'By submitting this form, you confirm that the information provided is accurate and that you are a Chandigarh University student.',
  handling: 'Your registration is emailed to the chapter team. It is not stored on this website.',
  success: {
    title: 'Thanks for getting in touch',
    text: 'Your details have been shared with the IEEE CTSoc CUSB Chapter team.',
    brand: 'IEEE CTSoc CUSB Chapter',
    tagline: 'Where Technology Meets Innovation.',
    eventsLabel: 'Explore upcoming events',
  },
};

// Institutional email domains that count as a CUCHD Outlook ID.
export const outlookDomains = ['cuchd.in'];

export const departments = [
  'Computer Science & Engineering (CSE)',
  'CSE, Apex Institute of Technology (AIT)',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Aerospace Engineering',
  'Biotechnology',
  'Computing (BCA / MCA)',
  'Business / Management',
  'Other',
];

export const courses = ['B.E.', 'B.Tech', 'B.E. CSE', 'B.E. CSE (AI & ML)', 'BCA', 'B.Sc.', 'M.E.', 'M.Tech', 'MCA', 'MBA', 'Ph.D.'];

export const OTHER_INTEREST = 'Other';

export const interests = [
  'Hackathons',
  'Technical Workshops',
  'Expert Talks & Seminars',
  'Technical Competitions',
  'Research & Innovation',
  'Projects & Development',
  'Artificial Intelligence & Machine Learning',
  'Cybersecurity',
  'Consumer Technology',
  'IoT & Smart Technologies',
  'Networking & Industry Interaction',
  'Leadership & Volunteering',
  'Community & Social Initiatives',
  OTHER_INTEREST,
];

const digits = (value) => value.replace(/[\s()-]/g, '').replace(/^(\+?91|0)(?=\d{10}$)/, '');

/**
 * type      'text' | 'email' | 'tel' | 'combo' (text with suggestions) |
 *           'choice' (pick one) | 'multi' (pick any)
 * required  message shown when the field is empty
 * check     returns an error message, or nothing when the value is fine
 */
export const fields = {
  name: {
    label: 'Full name',
    type: 'text',
    autoComplete: 'name',
    maxLength: 80,
    required: 'Please enter your name.',
  },
  uid: {
    label: 'UID',
    type: 'text',
    placeholder: 'For example 24XYZ10001',
    autoComplete: 'off',
    maxLength: 16,
    uppercase: true,
    required: 'Please enter your UID.',
    check: (value) =>
      /^[A-Z]?\d{2}[A-Z]{2,5}\d{3,6}$/.test(value.replace(/\s/g, '').toUpperCase())
        ? null
        : 'That does not look like a CU UID. Enter it as printed on your ID card.',
  },
  section: {
    label: 'Section',
    type: 'text',
    placeholder: 'Your class section or group',
    autoComplete: 'off',
    maxLength: 40,
    required: 'Please enter your section.',
  },
  department: {
    label: 'Department',
    type: 'combo',
    options: departments,
    placeholder: 'Start typing or pick from the list',
    maxLength: 80,
    required: 'Please choose your department.',
  },
  course: {
    label: 'Course / Program',
    type: 'combo',
    options: courses,
    placeholder: 'For example B.E. CSE',
    maxLength: 80,
    required: 'Please enter your course or program.',
  },
  email: {
    label: 'CUCHD Outlook ID',
    type: 'email',
    placeholder: 'youruid@cuchd.in',
    autoComplete: 'email',
    maxLength: 120,
    required: 'Please enter your CUCHD Outlook ID.',
    check: (value) => {
      const email = value.trim().toLowerCase();
      const ok =
        /^[^\s@]+@[^\s@]+$/.test(email) && outlookDomains.some((domain) => email.endsWith(`@${domain}`));
      return ok ? null : 'Please enter a valid CUCHD Outlook ID.';
    },
  },
  phone: {
    label: 'Contact number',
    type: 'tel',
    placeholder: '10-digit mobile number',
    autoComplete: 'tel',
    maxLength: 20,
    required: 'Please enter your contact number.',
    check: (value) =>
      /^[6-9]\d{9}$/.test(digits(value)) ? null : 'Please enter a valid 10-digit Indian mobile number.',
  },
  studentType: {
    label: 'Student type',
    type: 'choice',
    options: [
      { value: 'Day Scholar', hint: 'I travel to campus' },
      { value: 'Hosteller', hint: 'I live on campus' },
    ],
    required: 'Please choose Day Scholar or Hosteller.',
  },
  interests: {
    label: 'What are you interested in?',
    type: 'multi',
    options: interests,
    required: 'Please select at least one area of interest.',
  },
  otherInterest: {
    label: 'Tell us what you’re interested in',
    type: 'text',
    maxLength: 120,
    required: 'Please tell us what you are interested in.',
  },
};

// The three parts of the form, in order.
export const steps = [
  {
    id: 'details',
    label: 'Student Details',
    title: 'Your details',
    text: 'As they appear on your university ID.',
    fields: ['name', 'uid', 'section', 'department', 'course'],
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Your contact',
    text: 'So the chapter team can reach you.',
    fields: ['email', 'phone', 'studentType'],
  },
  {
    id: 'interests',
    label: 'Interests',
    title: 'What are you interested in?',
    text: 'Tell us what kind of activities you would like to take part in through the IEEE CTSoc CUSB Chapter. Pick as many as you like.',
    fields: ['interests'],
  },
];

export const emptyRegistration = {
  name: '',
  uid: '',
  section: '',
  department: '',
  course: '',
  email: '',
  phone: '',
  studentType: '',
  interests: [],
  otherInterest: '',
  company: '', // honeypot: stays empty for real visitors
};

/** Errors for the given field names, as { field: message }. */
export function validateRegistration(values, names = Object.keys(fields)) {
  const errors = {};
  for (const name of names) {
    const field = fields[name];
    const value = values[name];
    if (name === 'otherInterest') continue; // handled with `interests`
    if (field.type === 'multi') {
      if (!value.length) errors[name] = field.required;
      else if (value.includes(OTHER_INTEREST) && !values.otherInterest.trim())
        errors.otherInterest = fields.otherInterest.required;
      continue;
    }
    if (!String(value).trim()) {
      errors[name] = field.required;
      continue;
    }
    const problem = field.check?.(String(value));
    if (problem) errors[name] = problem;
  }
  return errors;
}

/** The cleaned-up values that are sent to the server. */
export function toSubmission(values) {
  return {
    name: values.name.trim(),
    uid: values.uid.replace(/\s/g, '').toUpperCase(),
    section: values.section.trim(),
    department: values.department.trim(),
    course: values.course.trim(),
    email: values.email.trim().toLowerCase(),
    phone: digits(values.phone),
    studentType: values.studentType,
    interests: values.interests,
    otherInterest: values.interests.includes(OTHER_INTEREST) ? values.otherInterest.trim() : '',
    company: values.company,
  };
}
