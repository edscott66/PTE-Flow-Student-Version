export const HIGHLIGHT_CORRECT_SUMMARY_QUESTIONS = [
  {
    id: '1',
    title: 'My New House',
    question: 'Which summary best matches the recording?',
    // The transcript is used by the app to generate the audio via Text-to-Speech
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/1.mp3',
    transcript: "Audio will begin in 10 seconds... I live in a new house now. It is small, but it is very nice. It has two bedrooms and one bathroom. The kitchen is my favorite room because it has a big window. I like to cook food there. There is also a small garden outside. I like to sit in the garden when it is sunny. I am very happy in my new home.",
    options: [
      { id: '1', text: 'The speaker lives in a big house with three bedrooms. He likes the garden, but he does not like the kitchen because it is too small.' },
      { id: '2', text: 'The speaker has a new, small house with two bedrooms and a garden. He likes the kitchen and enjoys sitting in the garden when the sun shines.' },
      { id: '3', text: 'The speaker is moving to a new apartment next week. He wants a house with a big kitchen and a garden, but he cannot find one.' }
    ],
    correctOption: '2',
    explanation: 'Correct: Option 2 captures the main points (new/small house, garden, likes kitchen). Option 1 has wrong details (3 bedrooms). Option 3 is wrong because he already lives there.'
  },
  {
    id: '2',
    title: 'Saturday Morning',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/2.mp3',
    transcript: "Audio will begin in 10 seconds... On Saturday mornings, I wake up at eight o'clock. I do not go to work. First, I eat eggs and drink coffee for breakfast. Then, I go to the park with my dog. We run and play for one hour. My dog loves the park. After that, I go to the supermarket to buy food for the week. It is a busy morning, but I like it.",
    options: [
      { id: '1', text: 'The speaker wakes up early on Saturday to go to work. After work, he goes to the supermarket to buy food for his dog.' },
      { id: '2', text: 'On Saturdays, the speaker wakes up at eight oclock. He eats breakfast, goes to the park with his dog, and then goes shopping for food.' },
      { id: '3', text: 'The speaker sleeps late on Saturday. He eats eggs for lunch and then stays at home all day with his dog because he is tired.' }
    ],
    correctOption: '2',
    explanation: 'Correct: Option 2 lists the correct sequence (8am, breakfast, park, shopping). Option 1 is wrong (he does not work). Option 3 is wrong (he goes out).'
  },
  {
    id: '3',
    title: "My Sister's Job",
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/3.mp3',
    transcript: "Audio will begin in 10 seconds... My sister is a teacher. She works at a school near our house. She teaches English to young children. She loves her job because the children are funny and kind. She works from Monday to Friday. On the weekend, she is tired, so she relaxes at home. She wants to be a writer in the future, but now she is happy as a teacher.",
    options: [
      { id: '1', text: 'The speaker\'s sister is a teacher who works with young children. She likes her job, works on weekdays, and relaxes on the weekend.' },
      { id: '2', text: 'The speaker\'s sister does not like her job as a teacher. She wants to stop working and become a writer immediately.' },
      { id: '3', text: 'The speaker\'s sister works at a hospital near their house. She works every day, including Saturday and Sunday, so she is very tired.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 covers the job, feelings, and schedule correctly. Option 2 implies she wants to quit now (incorrect). Option 3 has the wrong workplace.'
  },
  {
    id: '4',
    title: 'Planning a Holiday',
    question: 'Which is the best summary?',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/4.mp3',
    transcript: "Audio will begin in 10 seconds... Next month, I am going on holiday. I am going to Italy with my friends. We are going by plane. We want to visit Rome and see the old buildings. We also want to eat pizza and pasta. The hotel is in the city center. I am very excited because I love to travel. I need to pack my bag and buy a new camera.",
    options: [
      { id: '1', text: 'The speaker is in Italy now. He is eating pizza and visiting old buildings with his family, but he lost his camera.' },
      { id: '2', text: 'The speaker is going to Italy next month with friends. They will fly there, stay in a hotel, and visit Rome.' },
      { id: '3', text: 'The speaker wants to go to Italy, but he cannot go because he does not have a plane ticket or a hotel.' }
    ],
    correctOption: '2',
    explanation: 'Correct: Option 2 matches the future plans accurately. Option 1 says he is there "now" (incorrect). Option 3 claims he cannot go (incorrect).'
  },
  {
    id: '5',
    title: 'The Weather Today',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/5.mp3',
    transcript: "Audio will begin in 10 seconds... Today, the weather is very bad. It is raining and it is very cold. The sky is grey and there is no sun. I want to play football outside, but I cannot. I must stay inside the house. I will watch a movie and drink hot chocolate to stay warm. I hope the weather is sunny tomorrow.",
    options: [
      { id: '1', text: 'It is a hot and sunny day. The speaker is playing football outside with his friends and having fun.' },
      { id: '2', text: 'The weather is cold and rainy today. The speaker cannot play outside, so he will stay inside and watch a movie.' },
      { id: '3', text: 'It is raining today, but the speaker will play football outside anyway because he likes the rain.' }
    ],
    correctOption: '2',
    explanation: 'Correct: Option 2 identifies the bad weather and the indoor activity correctly. Option 1 describes sunny weather. Option 3 claims he will play outside (incorrect).'
  },
  {
    id: '6',
    title: 'My Daily Routine',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/6.mp3',
    transcript: "Audio will begin in 10 seconds... I wake up at 7 a.m. every day. I eat breakfast with my family. Then I go to school. After school, I play with my friends at the park. In the evening, I do my homework and have dinner.",
    options: [
      { id: '1', text: 'The speaker wakes up early, goes to school, and enjoys playing with friends.' },
      { id: '2', text: 'The speaker stays at home all day and never goes to school.' },
      { id: '3', text: 'The speaker wakes up late and never does homework.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 summarises the speaker’s daily routine, including waking up early, going to school, playing with friends, and doing homework. Option 2 is incorrect because the speaker goes to school. Option 3 is wrong because the speaker wakes up at 7 a.m. and does homework in the evening.'
  },

  {
    id: '7',
    title: 'My Favourite Food',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/7.mp3',
    transcript: "Audio will begin in 10 seconds... My favourite food is pizza. I like it with cheese and tomatoes. I usually eat pizza on Saturdays with my friends. Sometimes, I make pizza at home with my family.",
    options: [
      { id: '1', text: 'The speaker loves pizza and often eats it with friends and family.' },
      { id: '2', text: 'The speaker does not like pizza and prefers other foods.' },
      { id: '3', text: 'The speaker always eats pizza alone.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 correctly describes the speaker’s love for pizza and their regular eating habits with friends and family. Option 2 is incorrect because the speaker loves pizza, not other foods. Option 3 is wrong because the speaker sometimes makes pizza with their family, not always eating alone.'
  },

  {
    id: '8',
    title: 'The Park',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/8.mp3',
    transcript: "Audio will begin in 10 seconds... I like to go to the park on weekends. I walk there with my dog. At the park, I see many people running, playing football, and walking their dogs. I enjoy spending time there because it is relaxing.",
    options: [
      { id: '1', text: 'The speaker enjoys visiting the park to walk their dog and relax.' },
      { id: '2', text: 'The speaker dislikes the park and avoids going there.' },
      { id: '3', text: 'The speaker only visits the park to play football.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 accurately describes the speaker’s visit to the park, where they walk their dog and relax. Option 2 is incorrect because the speaker enjoys going to the park. Option 3 is wrong because the speaker visits the park to relax, not just to play football.'
  },

  {
    id: '9',
    title: 'A Family Picnic',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/9.mp3',
    transcript: "Audio will begin in 10 seconds... Last Sunday, my family went to the park for a picnic. We brought sandwiches, fruit, and juice. We played games and had fun. After the picnic, we walked around the lake and enjoyed the sunny weather.",
    options: [
      { id: '1', text: 'The family enjoyed a picnic at the park with food, games, and a walk.' },
      { id: '2', text: 'The family stayed indoors all day.' },
      { id: '3', text: 'The family went to the beach instead of the park.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 accurately describes the family picnic, including food, games, and a walk around the lake. Option 2 is incorrect because the family went to the park, not stayed indoors. Option 3 is wrong because the family went to the park, not the beach.'
  },
  {
    id: '10',
    title: 'A Visit to the Zoo',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/10.mp3',
    transcript: "Audio will begin in 10 seconds... Yesterday, we visited the zoo. We saw lions, monkeys, and tall giraffes. My little sister was afraid of the lions, but she liked the monkeys very much. We ate lunch near the lake and took many photos. It was a fun and exciting day for our family.",
    options: [
      { id: '1', text: 'The family had an enjoyable day at the zoo seeing animals and taking photos together.' },
      { id: '2', text: 'The family went to the beach and swam in the lake after seeing some animals.' },
      { id: '3', text: 'The speaker was alone at home watching animals on television.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 summarises the zoo visit and family enjoyment. Option 2 mentions a beach trip. Option 3 says the speaker was at home.'
  },
  {
    id: '11',
    title: 'Morning Routine',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/11.mp3',
    transcript: "Audio will begin in 10 seconds... Every weekday, I wake up at 6 a.m. I brush my teeth and have breakfast with my brother. Then we walk to school together. Our classes start at 8 a.m. After school, I usually do my homework and help my mother cook dinner.",
    options: [
      { id: '1', text: 'The speaker describes his daily weekday routine from morning until evening.' },
      { id: '2', text: 'The speaker talks about a holiday trip with his family.' },
      { id: '3', text: 'The speaker explains how to cook a special dinner recipe.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 accurately summarises the speaker’s daily routine, including waking up early, going to school, doing homework, and helping with dinner. Option 2 is incorrect because the speaker talks about a regular weekday routine, not a holiday. Option 3 is wrong because the speaker does not explain a dinner recipe but mentions helping with cooking.'
  },

  {
    id: '12',
    title: 'A New Bicycle',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/12.mp3',
    transcript: "Audio will begin in 10 seconds... For my birthday, my parents gave me a new bicycle. It is blue and very fast. I ride it every afternoon in the park near my house. My friends sometimes join me, and we race each other. I always wear a helmet to stay safe.",
    options: [
      { id: '1', text: 'The speaker received a bicycle for his birthday and enjoys riding it safely with friends.' },
      { id: '2', text: 'The speaker is afraid of riding bicycles and prefers to stay indoors.' },
      { id: '3', text: 'The speaker bought a car and drives it to school every day.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 correctly summarises the birthday gift and the speaker’s enjoyment of riding the bicycle safely with friends. Option 2 is incorrect because the speaker enjoys riding the bicycle, not avoiding it. Option 3 is wrong because the speaker talks about a bicycle, not a car.'
  },

  {
    id: '13',
    title: 'Healthy Eating',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/13.mp3',
    transcript: "Audio will begin in 10 seconds... My teacher says it is important to eat healthy food. Fruits and vegetables help our bodies grow strong. We should not eat too much candy or fast food. Drinking water is better than drinking soda. Healthy habits can help us feel better every day.",
    options: [
      { id: '1', text: 'The teacher explains the importance of healthy eating and avoiding too much junk food.' },
      { id: '2', text: 'The teacher is teaching students how to open a restaurant.' },
      { id: '3', text: 'The teacher says candy and soda are the best foods for children.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 reflects the teacher’s message about healthy eating and avoiding junk food. Option 2 is incorrect because the teacher is discussing healthy eating, not opening a restaurant. Option 3 is wrong because the teacher advises against candy and soda, not recommending them.'
  },
  {
    id: '14',
    title: 'Rainy Day Activities',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/14.mp3',
    transcript: "Audio will begin in 10 seconds... It rained all weekend, so we stayed at home. My father read a book, my mother baked a cake, and I played board games with my sister. Even though we could not go outside, we enjoyed spending time together indoors.",
    options: [
      { id: '1', text: 'The family was bored and unhappy because of the rain.' },
      { id: '2', text: 'The family spent a rainy weekend indoors doing different activities together.' },
      { id: '3', text: 'The family travelled to another city during the weekend.' }
    ],
    correctOption: '2',
    explanation: 'Correct: Option 2 summarises the indoor family activities. Option 1 says they were unhappy. Option 3 mentions travel.'
  },
  {
    id: '15',
    title: 'Library Rules',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/15.mp3',
    transcript: "Audio will begin in 10 seconds... Our school library is a quiet place for students to read and study. We must not talk loudly or use our phones inside. Students can borrow up to three books for two weeks. If they return books late, they must pay a small fine.",
    options: [
      { id: '1', text: 'Students can talk loudly and use phones freely in the library.' },
      { id: '2', text: 'The library allows students to play games and watch movies after school.' },
      { id: '3', text: 'The school library has rules about silence, borrowing limits, and late returns.' }
    ],
    correctOption: '3',
    explanation: 'Correct: Option 3 correctly summarises the library rules, including silence, borrowing limits, and fines. Option 1 is incorrect because talking loudly and using phones are not allowed. Option 2 is incorrect as the library does not allow playing games or watching movies.'
  },
  {
    id: '16',
    title: 'Bus Journey',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/16.mp3',
    transcript: "Audio will begin in 10 seconds... This morning, I missed my usual bus, so I had to wait 20 minutes for the next one. The bus was crowded, and there were no empty seats. I finally arrived at work just in time for my meeting.",
    options: [
      { id: '1', text: 'The speaker describes missing a bus and arriving at work just in time.' },
      { id: '2', text: 'The speaker drove to work comfortably in his own car.' },
      { id: '3', text: 'The speaker decided not to go to work at all.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 accurately describes the speaker missing the bus, waiting for the next one, and arriving just in time. Option 2 is incorrect because the speaker did not drive but took the bus. Option 3 is incorrect as the speaker went to work after a delay, not deciding not to go.'
  },
  {
    id: '17',
    title: 'School Sports Day',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/17.mp3',
    transcript: "Audio will begin in 10 seconds... Last Friday, our school had a sports day. Students competed in running, long jump, and relay races. Parents came to watch and cheer for their children. At the end of the day, medals were given to the winners.",
    options: [
      { id: '1', text: 'Students had regular classes and exams on Friday.' },
      { id: '2', text: 'The school organised a sports competition where students participated and winners received medals.' },
      { id: '3', text: 'The school cancelled all activities because of bad weather.' }
    ],
    correctOption: '2',
    explanation: 'Correct: Option 2 accurately describes the sports day activities, including student participation and medal distribution. Option 1 is incorrect because the day was dedicated to sports, not regular classes. Option 3 is incorrect because there is no mention of bad weather causing cancellations.'
  },
  {
    id: '18',
    title: 'Learning Online',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/18.mp3',
    transcript: "Audio will begin in 10 seconds... Many students now take online classes from home. They use computers and the internet to attend lessons and complete assignments. Although online learning is convenient, some students miss seeing their friends in person.",
    options: [
      { id: '1', text: 'Online learning allows students to study from home, though they may miss social interaction.' },
      { id: '2', text: 'Students refuse to use computers for studying.' },
      { id: '3', text: 'Schools have stopped teaching all subjects.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 accurately summarises the convenience of online learning, with the drawback of missing social interaction. Option 2 is incorrect because students do use computers for online learning. Option 3 is incorrect because schools are still teaching subjects online.'
  },
  {
    id: '19',
    title: 'Part-Time Job',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/19.mp3',
    transcript: "Audio will begin in 10 seconds... During the summer, I worked part-time at a small café. I served customers, cleaned tables, and learned how to make coffee. The job helped me earn money and improve my communication skills.",
    options: [
      { id: '1', text: 'The speaker disliked working and quit after one day.' },
      { id: '2', text: 'The speaker spent the summer travelling abroad.' },
      { id: '3', text: 'The speaker gained work experience and skills from a summer job at a café.' }
    ],
    correctOption: '3',
    explanation: 'Correct: Option 3 summarises the speaker’s work experience and skills gained. Option 1 is incorrect because the speaker did not dislike the job. Option 2 is incorrect because there is no mention of the speaker travelling abroad.'
  },
  {
    id: '20',
    title: 'Climate Change Effects',
    question: 'Select the correct summary:',
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/20.mp3',
    transcript: "Audio will begin in 10 seconds... Scientists warn that global temperatures are rising due to greenhouse gas emissions. This leads to melting ice caps, rising sea levels, and extreme weather events. Governments are encouraged to reduce carbon emissions and invest in renewable energy sources.",
    options: [
      { id: '1', text: 'Climate change causes environmental problems and requires government action.' },
      { id: '2', text: 'Scientists believe the climate is becoming cooler each year.' },
      { id: '3', text: 'There is no need for renewable energy or environmental protection.' }
    ],
    correctOption: '1',
    explanation: 'Correct: Option 1 summarises the causes, effects, and the need for action. Option 2 is incorrect because the climate is warming, not cooling. Option 3 is incorrect as renewable energy and environmental protection are part of the solution.'
  },

  //B1 Level (21-70)
  {
    id: "21",
    title: "Urban Green Spaces",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/21.mp3',
    transcript: "Audio will begin in 10 seconds... Urban green spaces provide residents with areas for relaxation and exercise. These spaces also help reduce city temperatures and improve air quality. As cities grow, planners emphasise the importance of maintaining accessible parks.",
    options: [
      { id: "1", text: "Green spaces are unnecessary because most people prefer indoor activities." },
      { id: "2", text: "Cities should replace parks with more buildings to support population growth." },
      { id: "3", text: "Green spaces only benefit wildlife and have little impact on people." },
      { id: "4", text: "Green spaces support public health and environmental quality in growing cities." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the benefits of green spaces for both people and the environment. The transcript highlights relaxation, exercise, and improved air quality. Options 1 and 2 contradict the text, while option 3 ignores the human benefits described."
  }, 
  {
    id: "22",
    title: "Online Learning Trends",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/22.mp3',
    transcript: "Audio will begin in 10 seconds... Online learning has become increasingly popular due to its flexibility and accessibility. Many students appreciate being able to study at their own pace. Educators continue to explore ways to make digital lessons more engaging.",
    options: [
      { id: "1", text: "Online learning is valued for its flexibility and continues to evolve." },
      { id: "2", text: "Students dislike online learning because it limits their study options." },
      { id: "3", text: "Digital lessons are being removed because they are too difficult to manage." },
      { id: "4", text: "Online learning is only useful for advanced students." }
    ],
    correctOption: "1",
    explanation: "Option 1 captures the main ideas of flexibility, accessibility, and ongoing improvement. Options 2 and 4 contradict the transcript, and option 3 incorrectly claims digital lessons are being removed."
  },
  {
    id: "23",
    title: "Healthy Eating Habits",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/23.mp3',
    transcript: "Audio will begin in 10 seconds... Healthy eating involves choosing foods that provide essential nutrients and support long-term well-being. Nutritionists recommend including fruits, vegetables, and whole grains in daily meals. These habits can reduce the risk of chronic illness.",
    options: [
      { id: "1", text: "Healthy eating is unnecessary because most people get enough nutrients naturally." },
      { id: "2", text: "People should avoid fruits and vegetables to prevent health problems." },
      { id: "3", text: "Healthy eating focuses on nutrient-rich foods that support long-term health." },
      { id: "4", text: "Whole grains are harmful and should be removed from daily meals." }
    ],
    correctOption: "3",
    explanation: "Option 3 reflects the transcript’s emphasis on nutrient-rich foods and long-term health. Options 1, 2, and 4 contradict the recommendations described in the passage."
  },
  {
    id: "24",
    title: "Public Transport Use",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/24.mp3',
    transcript: "Audio will begin in 10 seconds... Public transport systems help reduce traffic congestion and lower pollution levels in busy cities. Many governments invest in buses and trains to encourage people to travel more sustainably. These efforts aim to create cleaner and more efficient urban environments.",
    options: [
      { id: "1", text: "Public transport is unnecessary because most people prefer driving." },
      { id: "2", text: "Public transport supports sustainability and reduces congestion in cities." },
      { id: "3", text: "Governments are removing buses and trains to reduce costs." },
      { id: "4", text: "Public transport increases pollution and traffic problems." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the environmental and practical benefits described. Options 1 and 4 contradict the transcript, while option 3 is the opposite of what the passage states."
  },
  {
    id: "25",
    title: "Digital Privacy Awareness",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/25.mp3',
    transcript: "Audio will begin in 10 seconds... As people spend more time online, digital privacy has become a major concern. Experts advise users to create strong passwords and avoid sharing personal information. These practices help protect individuals from cyber threats.",
    options: [
      { id: "1", text: "Digital privacy is not important because most websites are safe." },
      { id: "2", text: "People should share more personal information to improve online services." },
      { id: "3", text: "Cyber threats are decreasing, so privacy measures are unnecessary." },
      { id: "4", text: "Digital privacy is essential, and users should take steps to protect themselves." }
    ],
    correctOption: "4",
    explanation: "Option 4 reflects the transcript’s focus on privacy risks and protective actions. Options 1, 2, and 3 contradict the advice given in the passage."
  },
  {
    id: "26",
    title: "Benefits of Reading",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/26.mp3',
    transcript: "Audio will begin in 10 seconds... Reading regularly helps improve vocabulary and strengthens concentration. Many educators encourage students to read a variety of texts to develop critical thinking skills. These habits support academic success over time.",
    options: [
      { id: "1", text: "Reading is unnecessary because it slows down learning." },
      { id: "2", text: "Reading supports vocabulary growth and long-term academic development." },
      { id: "3", text: "Students should avoid reading different types of texts." },
      { id: "4", text: "Reading only benefits people who already have strong skills." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s points about vocabulary, concentration, and academic growth. Options 1, 3, and 4 contradict the benefits described."
  },
  {
    id: "27",
    title: "Workplace Communication",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/27.mp3',
    transcript: "Audio will begin in 10 seconds... Effective communication in the workplace helps teams collaborate more efficiently. Clear instructions reduce misunderstandings and improve productivity. Many companies provide training to strengthen these skills.",
    options: [
      { id: "1", text: "Clear communication improves teamwork and reduces errors." },
      { id: "2", text: "Communication training is unnecessary because teams work well without it." },
      { id: "3", text: "Companies are removing communication training to save time." },
      { id: "4", text: "Misunderstandings are unavoidable, even with clear instructions." }
    ],
    correctOption: "1",
    explanation: "Option 1 captures the transcript’s focus on teamwork, clarity, and productivity. Options 2, 3, and 4 contradict the benefits described."
  },
  {
    id: "28",
    title: "Environmental Conservation",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/28.mp3',
    transcript: "Audio will begin in 10 seconds... Environmental conservation encourages people to use natural resources responsibly and protect ecosystems. Many groups promote recycling and tree planting to reduce environmental damage. These actions aim to support a healthier planet in the long term.",
    options: [
      { id: "1", text: "Conservation is unnecessary because nature repairs itself quickly." },
      { id: "2", text: "Tree planting harms the environment and should be avoided." },
      { id: "3", text: "Conservation promotes responsible resource use and long-term environmental health." },
      { id: "4", text: "Recycling programs are being removed due to low participation." }
    ],
    correctOption: "3",
    explanation: "Option 3 accurately summarises the transcript’s focus on responsible resource use and long-term environmental protection. Options 1 and 2 contradict the passage, while option 4 introduces information not mentioned."
  },
  {
    id: "29",
    title: "Community Volunteering",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/29.mp3',
    transcript: "Audio will begin in 10 seconds... Community volunteering helps strengthen neighbourhoods by bringing people together to support local activities. Volunteers contribute to events, clean-up efforts, and social programs. These actions help create a more connected and supportive community.",
    options: [
      { id: "1", text: "Volunteering reduces community involvement and weakens relationships." },
      { id: "2", text: "Most volunteers avoid participating in group activities." },
      { id: "3", text: "Volunteering is only useful for large cities, not small communities." },
      { id: "4", text: "Volunteering strengthens communities by supporting local activities and building connections." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on community support and connection. Options 1, 2, and 3 contradict the positive impact described."
  },
  {
    id: "30",
    title: "Healthy Lifestyle Choices",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/30.mp3',
    transcript: "Audio will begin in 10 seconds... A healthy lifestyle includes regular exercise, balanced meals, and sufficient rest. These habits help maintain physical and mental well-being. Many health experts encourage people to make small, consistent changes to improve their daily routines.",
    options: [
      { id: "1", text: "Healthy habits support overall well-being and can be developed gradually." },
      { id: "2", text: "Exercise and rest are unnecessary if meals are balanced." },
      { id: "3", text: "Healthy lifestyles require extreme changes to be effective." },
      { id: "4", text: "Experts recommend avoiding exercise to reduce stress." }
    ],
    correctOption: "1",
    explanation: "Option 1 reflects the transcript’s emphasis on balanced habits and gradual improvement. Options 2, 3, and 4 contradict the advice provided."
  },
  {
    id: "31",
    title: "The Role of Museums",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/31.mp3',
    transcript: "Audio will begin in 10 seconds... Museums play an important role in preserving cultural history and educating the public. They display artifacts that help visitors understand past societies and significant events. Many museums also offer programs that support lifelong learning.",
    options: [
      { id: "1", text: "Museums mainly focus on entertainment rather than education." },
      { id: "2", text: "Museums preserve cultural history and provide educational opportunities." },
      { id: "3", text: "Museums only display modern objects and avoid historical topics." },
      { id: "4", text: "Museums are closing because people no longer visit them." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on cultural preservation and education. Options 1 and 3 contradict the purpose of museums described. Option 4 introduces information not mentioned in the passage."
  },
  {
    id: "32",
    title: "Benefits of Outdoor Exercise",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/32.mp3',
    transcript: "Audio will begin in 10 seconds... Outdoor exercise provides both physical and mental health benefits. Fresh air and natural surroundings can reduce stress while supporting overall fitness. Many people choose outdoor activities to improve their well-being.",
    options: [
      { id: "1", text: "Outdoor exercise is harmful because it increases stress levels." },
      { id: "2", text: "People should avoid outdoor exercise and stay indoors." },
      { id: "3", text: "Outdoor exercise supports fitness and reduces stress in natural environments." },
      { id: "4", text: "Outdoor exercise is only useful for professional athletes." }
    ],
    correctOption: "3",
    explanation: "Option 3 reflects the transcript’s emphasis on both physical and mental benefits. Options 1 and 2 contradict the positive effects described. Option 4 limits the benefits to athletes, which the passage does not suggest."
  },
  {
    id: "33",
    title: "Library Technology",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/33.mp3',
    transcript: "Audio will begin in 10 seconds... Modern libraries now offer digital tools such as e-books and online databases. These resources help users access information quickly and conveniently. Libraries continue to adapt their services to meet changing community needs.",
    options: [
      { id: "1", text: "Libraries are expanding digital services to provide faster and more convenient access to information." },
      { id: "2", text: "Libraries are removing technology because users prefer printed books." },
      { id: "3", text: "Digital tools have replaced all traditional library services." },
      { id: "4", text: "Libraries no longer support community needs due to limited resources." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on digital tools and evolving services. Options 2 and 4 contradict the passage, while option 3 exaggerates the role of digital tools."
  },
  {
    id: "34",
    title: "The Value of Team Sports",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/34.mp3',
    transcript: "Audio will begin in 10 seconds... Team sports teach cooperation and communication skills that are useful in everyday life. Players learn to support one another and work toward shared goals. These experiences help build confidence and social awareness.",
    options: [
      { id: "1", text: "Team sports reduce cooperation by encouraging competition." },
      { id: "2", text: "Team sports are only beneficial for professional athletes." },
      { id: "3", text: "Team sports focus mainly on individual performance." },
      { id: "4", text: "Team sports develop cooperation, communication, and confidence." }
    ],
    correctOption: "4",
    explanation: "Option 4 captures the transcript’s emphasis on cooperation, communication, and confidence. Options 1 and 3 contradict the collaborative nature described. Option 2 limits the benefits to athletes, which is not supported by the passage."
  },
  {
    id: "35",
    title: "Recycling Awareness",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/35.mp3',
    transcript: "Audio will begin in 10 seconds... Recycling programs help reduce waste and conserve natural resources. Many communities encourage residents to separate materials such as paper, plastic, and glass. These efforts support a more sustainable environment.",
    options: [
      { id: "1", text: "Recycling increases waste and harms the environment." },
      { id: "2", text: "Recycling programs reduce waste and promote environmental sustainability." },
      { id: "3", text: "Communities discourage recycling because it is too expensive." },
      { id: "4", text: "Recycling is only useful for large cities." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on waste reduction and sustainability. Options 1 and 3 contradict the passage, while option 4 introduces an unnecessary limitation."
  },
  {
    id: "36",
    title: "The Importance of Water Safety",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/36.mp3',
    transcript: "Audio will begin in 10 seconds... Water safety education teaches people how to behave responsibly around lakes, rivers, and swimming pools. Learning basic skills such as floating and safe entry can prevent accidents. These lessons are especially important for children.",
    options: [
      { id: "1", text: "Water safety education helps prevent accidents by teaching responsible behaviour and basic skills." },
      { id: "2", text: "Water safety is unnecessary because accidents rarely happen." },
      { id: "3", text: "Only professional swimmers need to learn water safety skills." },
      { id: "4", text: "Water safety focuses mainly on advanced swimming techniques." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s emphasis on responsible behaviour and accident prevention. Options 2 and 3 contradict the importance described. Option 4 misrepresents the basic nature of the skills mentioned."
  },
  {
    id: "37",
    title: "The Growth of Online Shopping",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/37.mp3',
    transcript: "Audio will begin in 10 seconds... Online shopping has grown rapidly as more people choose to buy products from home. Customers appreciate the convenience and wide range of options available. Retailers continue to improve delivery services to meet rising demand.",
    options: [
      { id: "1", text: "Online shopping is declining because customers prefer physical stores." },
      { id: "2", text: "Retailers are reducing delivery services due to low demand." },
      { id: "3", text: "Online shopping is increasing due to convenience and improved services." },
      { id: "4", text: "Customers avoid online shopping because it offers limited choices." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on convenience, variety, and improved delivery. Options 1, 2, and 4 contradict the trends described."
  },
  {
    id: "38",
    title: "The Purpose of School Clubs",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/38.mp3',
    transcript: "Audio will begin in 10 seconds... School clubs give students opportunities to explore interests outside the classroom. These activities help develop social skills and encourage teamwork. Many schools offer a wide range of clubs to support student growth.",
    options: [
      { id: "1", text: "School clubs limit student interaction and discourage teamwork." },
      { id: "2", text: "Clubs are only useful for students who struggle academically." },
      { id: "3", text: "School clubs focus mainly on competitive activities." },
      { id: "4", text: "School clubs support personal growth by promoting interests and teamwork." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s emphasis on interests, social skills, and teamwork. Options 1, 2, and 3 contradict or oversimplify the purpose of school clubs."
  },
  {
    id: "39",
    title: "The Value of Public Libraries",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/39.mp3',
    transcript: "Audio will begin in 10 seconds... Public libraries provide free access to books, digital resources, and community programs. They support learning for people of all ages and backgrounds. Many libraries also offer quiet spaces for study and research.",
    options: [
      { id: "1", text: "Libraries support learning by offering free resources and community programs." },
      { id: "2", text: "Libraries are closing because people no longer read books." },
      { id: "3", text: "Libraries only serve students and academic researchers." },
      { id: "4", text: "Libraries focus mainly on entertainment rather than education." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on free resources and community learning. Options 2, 3, and 4 contradict the broad purpose described."
  },
  {
    id: "40",
    title: "Healthy Sleep Routines",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/40.mp3',
    transcript: "Audio will begin in 10 seconds... A consistent sleep routine helps regulate the body’s internal clock and improves daily functioning. Experts recommend going to bed at the same time each night. These habits support better concentration and overall well-being.",
    options: [
      { id: "1", text: "Sleep routines are unnecessary because the body adjusts naturally." },
      { id: "2", text: "Consistent sleep routines improve concentration and support well-being." },
      { id: "3", text: "People should avoid regular sleep schedules to stay flexible." },
      { id: "4", text: "Sleep routines only benefit young children." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s emphasis on consistency and well-being. Options 1, 3, and 4 contradict the advice provided."
  },
  {
    id: "41",
    title: "The Purpose of Recycling Education",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/41.mp3',
    transcript: "Audio will begin in 10 seconds... Recycling education teaches people how to sort waste correctly and understand the impact of their choices. Schools and community groups often run programs to raise awareness. These efforts help reduce pollution and protect natural resources.",
    options: [
      { id: "1", text: "Recycling education is unnecessary because most people already recycle." },
      { id: "2", text: "Recycling programs increase pollution and waste." },
      { id: "3", text: "Recycling education raises awareness and supports environmental protection." },
      { id: "4", text: "Recycling education focuses only on teaching advanced scientific concepts." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on awareness and environmental protection. Options 1 and 2 contradict the passage, while option 4 misrepresents the content of recycling education."
  },
  {
    id: "42",
    title: "The Rise of Remote Work",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/42.mp3',
    transcript: "Audio will begin in 10 seconds... Remote work has become more common as technology allows employees to work from home. Many workers appreciate the flexibility and reduced travel time. Companies continue to explore ways to support remote teams effectively.",
    options: [
      { id: "1", text: "Remote work is increasing due to flexibility and improved technology." },
      { id: "2", text: "Remote work is declining because employees dislike working from home." },
      { id: "3", text: "Companies are removing remote work options to reduce flexibility." },
      { id: "4", text: "Remote work only benefits people who live in large cities." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on flexibility and technological support. Options 2, 3, and 4 contradict the trends described."
  },
  {
    id: "43",
    title: "The Importance of First Aid",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/43.mp3',
    transcript: "Audio will begin in 10 seconds... First aid training teaches people how to respond quickly in emergency situations. Basic skills such as treating minor injuries or performing CPR can save lives. Many organisations encourage employees to complete first aid courses.",
    options: [
      { id: "1", text: "First aid training is unnecessary because emergencies are rare." },
      { id: "2", text: "First aid skills are only useful for medical professionals." },
      { id: "3", text: "First aid focuses mainly on advanced medical procedures." },
      { id: "4", text: "First aid training teaches essential skills that help people respond to emergencies." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s emphasis on essential skills and emergency response. Options 1, 2, and 3 contradict the practical nature of first aid training."
  },
  {
    id: "44",
    title: "The Value of Art Education",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/44.mp3',
    transcript: "Audio will begin in 10 seconds... Art education encourages creativity and helps students express their ideas visually. It also improves problem-solving skills by allowing learners to explore different approaches. Many schools include art programs to support balanced development.",
    options: [
      { id: "1", text: "Art education is unnecessary because it does not support learning." },
      { id: "2", text: "Art education promotes creativity and supports balanced student development." },
      { id: "3", text: "Art programs limit students by focusing only on technical skills." },
      { id: "4", text: "Art education is only useful for students who want to become artists." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on creativity and balanced development. Options 1, 3, and 4 contradict the broad benefits described."
  },
  {
    id: "45",
    title: "The Benefits of Walking",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/45.mp3',
    transcript: "Audio will begin in 10 seconds... Walking is a simple form of exercise that improves heart health and reduces stress. It requires no special equipment and can be done almost anywhere. Many health experts recommend walking daily to support overall well-being.",
    options: [
      { id: "1", text: "Walking is an easy exercise that supports heart health and reduces stress." },
      { id: "2", text: "Walking is only useful for people who cannot do other exercises." },
      { id: "3", text: "Walking requires expensive equipment and special training." },
      { id: "4", text: "Walking increases stress and should be avoided." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s emphasis on simplicity and health benefits. Options 2, 3, and 4 contradict the passage."
  },
  {
    id: "46",
    title: "The Purpose of Weather Forecasts",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/46.mp3',
    transcript: "Audio will begin in 10 seconds... Weather forecasts help people plan their daily activities by predicting temperature, rainfall, and wind conditions. These predictions support safety by warning communities about severe weather. Many people rely on forecasts to make informed decisions.",
    options: [
      { id: "1", text: "Weather forecasts are unnecessary because weather rarely changes." },
      { id: "2", text: "Forecasts focus only on entertainment rather than safety." },
      { id: "3", text: "Weather forecasts help people plan activities and stay safe during severe conditions." },
      { id: "4", text: "Forecasts are only useful for scientists and researchers." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on planning and safety. Options 1, 2, and 4 contradict the practical purpose described."
  },
  {
    id: "47",
    title: "The Role of Community Gardens",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/47.mp3',
    transcript: "Audio will begin in 10 seconds... Community gardens provide shared spaces where residents can grow fruits and vegetables. These gardens encourage healthy eating and strengthen neighbourhood relationships. Many cities support community gardening as part of local development.",
    options: [
      { id: "1", text: "Community gardens reduce social interaction by limiting shared activities." },
      { id: "2", text: "Community gardens promote healthy eating and help build stronger neighbourhoods." },
      { id: "3", text: "Community gardens are only useful for professional farmers." },
      { id: "4", text: "Community gardens focus mainly on selling produce for profit." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on healthy eating and community connection. Options 1 and 3 contradict the inclusive nature of community gardens. Option 4 introduces a commercial purpose not mentioned in the passage."
  },
  {
    id: "48",
    title: "The Purpose of Study Skills",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/48.mp3',
    transcript: "Audio will begin in 10 seconds... Study skills help students organise their time and understand information more effectively. Techniques such as note-taking and planning improve academic performance. These skills support long-term learning success.",
    options: [
      { id: "1", text: "Study skills are unnecessary because students learn naturally." },
      { id: "2", text: "Study skills focus only on memorising large amounts of information." },
      { id: "3", text: "Study skills improve organisation and support long-term academic success." },
      { id: "4", text: "Study skills are only useful for advanced learners." }
    ],
    correctOption: "3",
    explanation: "Option 3 reflects the transcript’s emphasis on organisation and long-term learning. Options 1 and 2 contradict the purpose of study skills. Option 4 limits the benefits to advanced learners, which the passage does not suggest."
  },
  {
    id: "49",
    title: "The Importance of Clean Water",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/49.mp3',
    transcript: "Audio will begin in 10 seconds... Access to clean water is essential for maintaining public health. Communities rely on safe water supplies for drinking, cooking, and hygiene. Governments invest in water treatment systems to ensure long-term safety.",
    options: [
      { id: "1", text: "Clean water is essential for health, and communities depend on safe supplies." },
      { id: "2", text: "Clean water is only necessary for cooking, not for drinking or hygiene." },
      { id: "3", text: "Water treatment systems are being removed because they are too expensive." },
      { id: "4", text: "Communities prefer untreated water because it tastes better." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on health and reliable water systems. Options 2 and 4 contradict the basic needs described. Option 3 introduces information not supported by the passage."
  },
  {
    id: "50",
    title: "The Value of School Libraries",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/50.mp3',
    transcript: "Audio will begin in 10 seconds... School libraries provide students with access to books, digital tools, and quiet study areas. These resources support independent learning and help students develop research skills. Many schools invest in library programs to enhance academic achievement.",
    options: [
      { id: "1", text: "School libraries are unnecessary because students prefer online entertainment." },
      { id: "2", text: "Libraries focus mainly on social activities rather than learning." },
      { id: "3", text: "Libraries only benefit students who already have strong research skills." },
      { id: "4", text: "School libraries support independent learning and help students develop research skills." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s emphasis on learning support and research development. Options 1 and 2 contradict the educational purpose described. Option 3 limits the benefits to a small group of students, which the passage does not suggest."
  },
  {
    id: "51",
    title: "The Benefits of Language Learning",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/51.mp3',
    transcript: "Audio will begin in 10 seconds... Learning a new language helps people communicate with others from different cultures. It also improves memory and problem‑solving skills. Many learners find that studying languages opens new personal and professional opportunities.",
    options: [
      { id: "1", text: "Language learning is unnecessary because most people speak the same language." },
      { id: "2", text: "Language learning improves communication and supports cognitive development." },
      { id: "3", text: "Language learning only benefits people who travel frequently." },
      { id: "4", text: "Language learning reduces problem‑solving skills over time." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on communication and cognitive benefits. Options 1 and 4 contradict the passage, while option 3 limits the benefits to travellers only."
  },
  {
    id: "52",
    title: "The Purpose of Recycling Bins",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/52.mp3',
    transcript: "Audio will begin in 10 seconds... Recycling bins help people separate waste into categories such as paper, plastic, and metal. This separation makes recycling more efficient and reduces the amount of waste sent to landfills. Many cities provide colour‑coded bins to guide residents.",
    options: [
      { id: "1", text: "Recycling bins are unnecessary because all waste is processed the same way." },
      { id: "2", text: "Recycling bins increase landfill waste by confusing residents." },
      { id: "3", text: "Recycling bins improve efficiency by helping people sort waste correctly." },
      { id: "4", text: "Recycling bins are only useful for large commercial buildings." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on sorting and efficiency. Options 1 and 2 contradict the purpose of recycling bins. Option 4 introduces a limitation not mentioned in the passage."
  },
  {
    id: "53",
    title: "The Role of Weather Apps",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/53.mp3',
    transcript: "Audio will begin in 10 seconds... Weather apps provide real‑time updates on temperature, rainfall, and wind conditions. These tools help people plan their daily activities and stay safe during severe weather. Many users rely on apps for quick and accurate information.",
    options: [
      { id: "1", text: "Weather apps offer real‑time information that helps people plan and stay safe." },
      { id: "2", text: "Weather apps are unreliable and rarely used by the public." },
      { id: "3", text: "Weather apps focus mainly on entertainment rather than safety." },
      { id: "4", text: "Weather apps are only useful for professional meteorologists." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s emphasis on planning and safety. Options 2, 3, and 4 contradict the usefulness described."
  },
  {
    id: "54",
    title: "The Value of Group Projects",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/54.mp3',
    transcript: "Audio will begin in 10 seconds... Group projects allow students to share ideas and learn from one another. Working in teams helps develop communication and problem‑solving skills. These experiences prepare students for collaborative environments in the future.",
    options: [
      { id: "1", text: "Group projects reduce learning by limiting student interaction." },
      { id: "2", text: "Group projects are only useful for advanced students." },
      { id: "3", text: "Group projects focus mainly on competition rather than cooperation." },
      { id: "4", text: "Group projects build communication skills and prepare students for teamwork." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on communication and teamwork. Options 1, 2, and 3 contradict the collaborative benefits described."
  },
  {
    id: "55",
    title: "The Purpose of Public Parks",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/55.mp3',
    transcript: "Audio will begin in 10 seconds... Public parks offer open spaces where people can relax, exercise, and enjoy nature. These areas provide a break from busy urban environments and support community well‑being. Many cities invest in parks to improve residents’ quality of life.",
    options: [
      { id: "1", text: "Public parks are unnecessary because most people prefer indoor activities." },
      { id: "2", text: "Public parks support relaxation, exercise, and overall community well‑being." },
      { id: "3", text: "Public parks are being removed to make space for more buildings." },
      { id: "4", text: "Public parks only benefit children and teenagers." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on relaxation, exercise, and well‑being. Options 1, 3, and 4 contradict the broad benefits described."
  },
  {
    id: "56",
    title: "The Importance of Handwashing",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/56.mp3',
    transcript: "Audio will begin in 10 seconds... Handwashing is one of the simplest ways to prevent the spread of illness. Using soap and water removes germs that can cause infections. Health organisations encourage regular handwashing to protect communities.",
    options: [
      { id: "1", text: "Handwashing is unnecessary because germs cannot be removed easily." },
      { id: "2", text: "Handwashing is only important for people working in hospitals." },
      { id: "3", text: "Handwashing prevents illness by removing harmful germs." },
      { id: "4", text: "Handwashing increases the spread of infection." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on illness prevention. Options 1, 2, and 4 contradict the health advice described."
  },
  {
    id: "57",
    title: "The Purpose of School Assemblies",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/57.mp3',
    transcript: "Audio will begin in 10 seconds... School assemblies bring students together to share important announcements and celebrate achievements. They help build a sense of community and encourage positive behaviour. Many schools use assemblies to promote shared values.",
    options: [
      { id: "1", text: "School assemblies build community and promote shared values." },
      { id: "2", text: "School assemblies are unnecessary because students prefer staying in class." },
      { id: "3", text: "School assemblies focus mainly on entertainment rather than learning." },
      { id: "4", text: "School assemblies reduce communication between students and teachers." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on community and shared values. Options 2, 3, and 4 contradict the purpose described."
  },
  {
    id: "58",
    title: "The Benefits of Nature Walks",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/58.mp3',
    transcript: "Audio will begin in 10 seconds... Nature walks help people relax and reduce stress by providing a peaceful environment. Spending time outdoors also supports physical health through gentle exercise. Many health experts recommend nature walks as part of a balanced lifestyle.",
    options: [
      { id: "1", text: "Nature walks increase stress and should be avoided." },
      { id: "2", text: "Nature walks are only useful for people who exercise regularly." },
      { id: "3", text: "Nature walks focus mainly on competitive outdoor activities." },
      { id: "4", text: "Nature walks support relaxation, reduce stress, and promote gentle exercise." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on relaxation and gentle exercise. Options 1, 2, and 3 contradict the benefits described."
  },
  {
    id: "59",
    title: "The Purpose of Recycling Campaigns",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/59.mp3',
    transcript: "Audio will begin in 10 seconds... Recycling campaigns aim to educate the public about reducing waste and protecting the environment. These campaigns encourage people to recycle more materials and make sustainable choices. Many communities use posters and events to raise awareness.",
    options: [
      { id: "1", text: "Recycling campaigns discourage people from participating in environmental activities." },
      { id: "2", text: "Recycling campaigns educate the public and promote sustainable choices." },
      { id: "3", text: "Recycling campaigns focus mainly on reducing community events." },
      { id: "4", text: "Recycling campaigns are unnecessary because waste levels are already low." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on education and sustainability. Options 1, 3, and 4 contradict the goals described."
  },
  {
    id: "60",
    title: "The Value of Reading Aloud",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/60.mp3',
    transcript: "Audio will begin in 10 seconds... Reading aloud helps improve pronunciation and builds confidence in language learners. It also strengthens listening skills by allowing learners to hear the rhythm of the language. Teachers often use reading aloud to support speaking development.",
    options: [
      { id: "1", text: "Reading aloud is unnecessary because it slows down learning." },
      { id: "2", text: "Reading aloud is only useful for advanced speakers." },
      { id: "3", text: "Reading aloud improves pronunciation, confidence, and listening skills." },
      { id: "4", text: "Reading aloud focuses mainly on memorising long texts." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on pronunciation, confidence, and listening. Options 1, 2, and 4 contradict the benefits described."
  },
  {
    id: "61",
    title: "The Purpose of School Rules",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/61.mp3',
    transcript: "Audio will begin in 10 seconds... School rules help create a safe and organised learning environment. They guide students on how to behave respectfully and responsibly. These rules support positive relationships and smooth daily routines.",
    options: [
      { id: "1", text: "School rules promote safety, responsibility, and positive behaviour." },
      { id: "2", text: "School rules limit learning by restricting student freedom." },
      { id: "3", text: "School rules focus mainly on punishing students." },
      { id: "4", text: "School rules are unnecessary because students behave naturally." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on safety and responsibility. Options 2, 3, and 4 contradict the purpose described."
  },
  {
    id: "62",
    title: "The Importance of Clean Air",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/62.mp3',
    transcript: "Audio will begin in 10 seconds... Clean air is essential for maintaining good health and preventing respiratory problems. Cities monitor air quality to protect residents from harmful pollution. Many governments promote cleaner transport options to improve air conditions.",
    options: [
      { id: "1", text: "Clean air is unnecessary because pollution has little effect on health." },
      { id: "2", text: "Air quality monitoring is being reduced because it is not useful." },
      { id: "3", text: "Clean air only benefits people who exercise regularly." },
      { id: "4", text: "Clean air supports public health, and cities work to reduce pollution." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on health and pollution reduction. Options 1, 2, and 3 contradict the information provided."
  },
  {
    id: "63",
    title: "The Purpose of School Clubs",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/63.mp3',
    transcript: "Audio will begin in 10 seconds... School clubs allow students to explore interests beyond the classroom and develop new skills. These activities encourage teamwork and help students build confidence in a supportive environment. Many schools offer a wide range of clubs to promote balanced development.",
    options: [
      { id: "1", text: "School clubs limit student growth by focusing only on academic subjects." },
      { id: "2", text: "School clubs help students explore interests, build skills, and develop confidence." },
      { id: "3", text: "School clubs are only useful for students who struggle socially." },
      { id: "4", text: "School clubs focus mainly on competitive activities rather than learning." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s emphasis on exploration, skill development, and confidence. Options 1 and 4 contradict the broad purpose of school clubs. Option 3 limits the benefits to a small group of students, which the passage does not suggest."
  },
  {
    id: "64",
    title: "The Importance of Saving Energy",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/64.mp3',
    transcript: "Audio will begin in 10 seconds... Saving energy helps reduce environmental impact and lowers household costs. Simple actions such as turning off unused lights and choosing efficient appliances make a meaningful difference. Many organisations encourage people to adopt energy‑saving habits.",
    options: [
      { id: "1", text: "Saving energy is unnecessary because it has little effect on the environment." },
      { id: "2", text: "Energy‑saving habits are only useful for large companies." },
      { id: "3", text: "Saving energy reduces environmental impact and helps lower costs." },
      { id: "4", text: "Energy efficiency focuses mainly on replacing all household appliances." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on environmental and financial benefits. Options 1 and 2 contradict the passage, while option 4 exaggerates the actions required."
  },
  {
    id: "65",
    title: "The Value of Daily Reading",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/65.mp3',
    transcript: "Audio will begin in 10 seconds... Daily reading helps strengthen vocabulary and improves concentration over time. It also encourages imagination by exposing readers to different ideas and perspectives. Many educators recommend reading regularly to support academic growth.",
    options: [
      { id: "1", text: "Daily reading improves vocabulary, concentration, and overall academic growth." },
      { id: "2", text: "Daily reading is unnecessary because most people learn through videos." },
      { id: "3", text: "Daily reading limits imagination by focusing on repetitive topics." },
      { id: "4", text: "Daily reading is only useful for advanced learners." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on vocabulary, concentration, and academic benefits. Options 2 and 3 contradict the passage, while option 4 limits the benefits to a small group of learners."
  },
  {
    id: "66",
    title: "The Purpose of Public Announcements",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/66.mp3',
    transcript: "Audio will begin in 10 seconds... Public announcements provide important information to large groups of people quickly. They are used to share updates about safety, events, or community changes. Clear announcements help ensure that everyone receives the same message.",
    options: [
      { id: "1", text: "Public announcements are unnecessary because people rarely need updates." },
      { id: "2", text: "Public announcements focus mainly on entertainment rather than information." },
      { id: "3", text: "Public announcements are only useful for small groups." },
      { id: "4", text: "Public announcements share important information clearly and efficiently." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s emphasis on clarity and information sharing. Options 1, 2, and 3 contradict the purpose described."
  },
  {
    id: "67",
    title: "The Benefits of Healthy Snacks",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/67.mp3',
    transcript: "Audio will begin in 10 seconds... Healthy snacks such as fruit and nuts provide steady energy throughout the day. They help people avoid overeating by keeping hunger under control. Nutritionists recommend choosing snacks that are low in sugar and high in nutrients.",
    options: [
      { id: "1", text: "Healthy snacks increase hunger and reduce energy levels." },
      { id: "2", text: "Healthy snacks are only useful for athletes." },
      { id: "3", text: "Healthy snacks provide steady energy and help control hunger." },
      { id: "4", text: "Healthy snacks should be avoided because they contain too much sugar." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on energy and hunger control. Options 1 and 4 contradict the nutritional benefits described. Option 2 limits the benefits to athletes, which the passage does not suggest."
  },
  {
    id: "68",
    title: "The Purpose of Safety Signs",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/68.mp3',
    transcript: "Audio will begin in 10 seconds... Safety signs provide clear instructions that help prevent accidents in public spaces. They warn people about potential dangers and guide them toward safe behaviour. These signs are an essential part of maintaining community safety.",
    options: [
      { id: "1", text: "Safety signs prevent accidents by warning people about dangers and guiding safe behaviour." },
      { id: "2", text: "Safety signs are unnecessary because people naturally avoid danger." },
      { id: "3", text: "Safety signs focus mainly on advertising rather than safety." },
      { id: "4", text: "Safety signs are only useful in workplaces, not public areas." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on accident prevention and guidance. Options 2, 3, and 4 contradict the purpose described."
  },
  {
    id: "69",
    title: "The Value of Community Events",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/69.mp3',
    transcript: "Audio will begin in 10 seconds... Community events bring residents together to celebrate local culture and share experiences. These gatherings strengthen social connections and encourage participation in neighbourhood activities. Many towns organise regular events to support community spirit.",
    options: [
      { id: "1", text: "Community events reduce social interaction by separating residents." },
      { id: "2", text: "Community events strengthen social connections and support community spirit." },
      { id: "3", text: "Community events are only useful for promoting local businesses." },
      { id: "4", text: "Community events discourage participation in neighbourhood activities." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on connection and community spirit. Options 1 and 4 contradict the purpose described. Option 3 introduces a narrow focus not supported by the passage."
  },
  {
    id: "70",
    title: "The Importance of Time Management",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/70.mp3',
    transcript: "Audio will begin in 10 seconds... Time management helps people organise their tasks and reduce stress. Planning ahead allows individuals to complete work more efficiently and avoid last‑minute pressure. Many educators teach time‑management strategies to support student success.",
    options: [
      { id: "1", text: "Time management increases stress by adding unnecessary planning." },
      { id: "2", text: "Time management is only useful for people with very busy schedules." },
      { id: "3", text: "Time management focuses mainly on reducing the number of tasks." },
      { id: "4", text: "Time management improves efficiency and reduces stress through better planning." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s emphasis on planning and reduced stress. Options 1, 2, and 3 contradict the benefits described."
  },

  //B1+ (71-120)
  {
    id: "71",
    title: "Urban Cycling Programs",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/71.mp3',
    transcript: "Audio will begin in 10 seconds... Urban cycling programs encourage residents to use bicycles for short trips instead of cars. These initiatives help reduce traffic congestion and improve air quality. Many cities invest in bike lanes to support safer travel.",
    options: [
      { id: "1", text: "Cycling programs increase traffic by adding more vehicles to the road." },
      { id: "2", text: "Cycling programs are only useful for professional athletes." },
      { id: "3", text: "Cycling programs reduce congestion and improve air quality through safer travel options." },
      { id: "4", text: "Cycling programs discourage people from using public transport." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on reduced congestion and improved air quality. Options 1 and 4 contradict the environmental benefits described. Option 2 limits the program to athletes, which is not supported."
  },
  {
    id: "72",
    title: "The Value of Digital Literacy",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/72.mp3',
    transcript: "Audio will begin in 10 seconds... Digital literacy helps people use technology confidently in everyday life. It includes skills such as searching for information, communicating online, and recognising reliable sources. These abilities are increasingly important in modern workplaces.",
    options: [
      { id: "1", text: "Digital literacy teaches essential skills for using technology confidently and responsibly." },
      { id: "2", text: "Digital literacy is unnecessary because most people avoid using technology." },
      { id: "3", text: "Digital literacy focuses mainly on repairing computers." },
      { id: "4", text: "Digital literacy is only useful for people working in IT." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s emphasis on confidence and essential skills. Options 2 and 3 contradict the purpose described. Option 4 limits the benefits to IT workers, which the passage does not state."
  },
  {
    id: "73",
    title: "The Purpose of Public Libraries",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/73.mp3',
    transcript: "Audio will begin in 10 seconds... Public libraries offer free access to books, digital tools, and community programs. They support learning for people of all ages and provide quiet spaces for study. Many libraries also host events that encourage community engagement.",
    options: [
      { id: "1", text: "Libraries are unnecessary because most people prefer online entertainment." },
      { id: "2", text: "Libraries focus mainly on storing old books with little community value." },
      { id: "3", text: "Libraries only serve students and academic researchers." },
      { id: "4", text: "Libraries support learning and community engagement through free resources and programs." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on learning and community programs. Options 1, 2, and 3 contradict the broad purpose described."
  },
  {
    id: "74",
    title: "The Benefits of Meditation",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/74.mp3',
    transcript: "Audio will begin in 10 seconds... Meditation helps people manage stress by encouraging calm and focused breathing. Regular practice can improve emotional well‑being and support better concentration. Many health professionals recommend meditation as part of a balanced lifestyle.",
    options: [
      { id: "1", text: "Meditation increases stress by forcing people to sit still." },
      { id: "2", text: "Meditation reduces stress and improves emotional well‑being through regular practice." },
      { id: "3", text: "Meditation is only useful for people who already have strong concentration skills." },
      { id: "4", text: "Meditation focuses mainly on physical exercise rather than mental health." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s emphasis on stress reduction and emotional well‑being. Options 1 and 4 contradict the purpose described. Option 3 limits the benefits to a small group of people."
  },
  {
    id: "75",
    title: "The Role of Weather Warnings",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/75.mp3',
    transcript: "Audio will begin in 10 seconds... Weather warnings alert communities to dangerous conditions such as storms or heavy rainfall. These alerts help people prepare by taking safety measures and avoiding risky areas. Effective warnings can prevent injuries and protect property.",
    options: [
      { id: "1", text: "Weather warnings are unnecessary because storms rarely cause damage." },
      { id: "2", text: "Weather warnings focus mainly on entertainment rather than safety." },
      { id: "3", text: "Weather warnings are only useful for people living near the coast." },
      { id: "4", text: "Weather warnings help communities prepare for dangerous conditions and stay safe." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on safety and preparation. Options 1, 2, and 3 contradict the purpose described."
  },
  {
    id: "76",
    title: "The Purpose of Career Fairs",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/76.mp3',
    transcript: "Audio will begin in 10 seconds... Career fairs connect job seekers with employers and provide information about different industries. Attendees can ask questions, explore opportunities, and learn about required skills. These events help people make informed career decisions.",
    options: [
      { id: "1", text: "Career fairs are unnecessary because most jobs are found online." },
      { id: "2", text: "Career fairs help people explore opportunities and make informed career choices." },
      { id: "3", text: "Career fairs focus mainly on selling training courses." },
      { id: "4", text: "Career fairs are only useful for people with advanced qualifications." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on exploration and informed decisions. Options 1 and 3 contradict the purpose described. Option 4 limits the benefits to a small group."
  },
  {
    id: "77",
    title: "The Value of Cultural Festivals",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/77.mp3',
    transcript: "Audio will begin in 10 seconds... Cultural festivals celebrate traditions through music, food, and performances. These events help communities share their heritage and learn about different cultures. Many cities host festivals to promote diversity and understanding.",
    options: [
      { id: "1", text: "Cultural festivals promote diversity by sharing traditions and encouraging understanding." },
      { id: "2", text: "Cultural festivals discourage participation by focusing only on local traditions." },
      { id: "3", text: "Cultural festivals are only useful for tourists." },
      { id: "4", text: "Cultural festivals reduce cultural understanding by limiting interaction." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on diversity and shared traditions. Options 2, 3, and 4 contradict the purpose described."
  },
  {
    id: "78",
    title: "The Importance of Healthy Breakfasts",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/78.mp3',
    transcript: "Audio will begin in 10 seconds... A healthy breakfast provides energy for the morning and supports concentration throughout the day. Nutritionists recommend including whole grains, fruit, and protein for balanced nutrition. These habits help maintain long‑term health.",
    options: [
      { id: "1", text: "Breakfast is unnecessary because most people get enough energy from snacks." },
      { id: "2", text: "Breakfast should be avoided to improve concentration." },
      { id: "3", text: "Healthy breakfasts provide energy and support long‑term health." },
      { id: "4", text: "Breakfast is only important for athletes." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on energy and long‑term health. Options 1, 2, and 4 contradict the nutritional advice described."
  },
  {
    id: "79",
    title: "The Purpose of Fire Drills",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/79.mp3',
    transcript: "Audio will begin in 10 seconds... Fire drills teach people how to evacuate buildings safely during emergencies. Practising these procedures helps reduce panic and ensures everyone knows the correct exit routes. Schools and workplaces conduct drills regularly to improve safety.",
    options: [
      { id: "1", text: "Fire drills improve safety by teaching people how to evacuate calmly and correctly." },
      { id: "2", text: "Fire drills are unnecessary because fires rarely occur." },
      { id: "3", text: "Fire drills focus mainly on testing alarm systems." },
      { id: "4", text: "Fire drills are only useful for large buildings." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on safety and preparedness. Options 2, 3, and 4 contradict the purpose described."
  },
  {
    id: "80",
    title: "The Value of Outdoor Learning",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/80.mp3',
    transcript: "Audio will begin in 10 seconds... Outdoor learning allows students to explore nature while developing practical skills. Activities such as observing wildlife or conducting simple experiments make lessons more engaging. Many teachers use outdoor learning to support curiosity and teamwork.",
    options: [
      { id: "1", text: "Outdoor learning reduces engagement by removing students from the classroom." },
      { id: "2", text: "Outdoor learning is only useful for science subjects." },
      { id: "3", text: "Outdoor learning focuses mainly on physical exercise." },
      { id: "4", text: "Outdoor learning builds practical skills and encourages curiosity through real‑world activities." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on practical skills and curiosity. Options 1, 2, and 3 contradict the benefits described."
  },
  {
    id: "81",
    title: "The Purpose of Public Health Campaigns",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/81.mp3',
    transcript: "Audio will begin in 10 seconds... Public health campaigns aim to educate people about healthy behaviours such as handwashing, exercise, and balanced eating. These campaigns use posters, videos, and community events to spread information. Their goal is to reduce illness and improve overall well‑being.",
    options: [
      { id: "1", text: "Public health campaigns educate people about healthy habits to reduce illness." },
      { id: "2", text: "Public health campaigns discourage people from following medical advice." },
      { id: "3", text: "Public health campaigns focus mainly on advertising products." },
      { id: "4", text: "Public health campaigns are unnecessary because most people already live healthily." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on education and illness prevention. Options 2, 3, and 4 contradict the purpose described."
  },
  {
    id: "82",
    title: "The Benefits of Group Discussions",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/82.mp3',
    transcript: "Audio will begin in 10 seconds... Group discussions allow students to share ideas and learn from different perspectives. These conversations help develop communication skills and encourage critical thinking. Teachers often use discussions to make lessons more interactive.",
    options: [
      { id: "1", text: "Group discussions reduce learning by limiting student participation." },
      { id: "2", text: "Group discussions focus mainly on memorising information." },
      { id: "3", text: "Group discussions build communication skills and encourage critical thinking." },
      { id: "4", text: "Group discussions are only useful for advanced learners." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on communication and critical thinking. Options 1, 2, and 4 contradict the purpose described."
  },
  {
    id: "83",
    title: "The Purpose of Recycling Centres",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/83.mp3',
    transcript: "Audio will begin in 10 seconds... Recycling centres collect materials such as paper, plastic, and metal so they can be processed and reused. These centres help reduce landfill waste and conserve natural resources. Many communities encourage residents to use recycling facilities regularly.",
    options: [
      { id: "1", text: "Recycling centres increase waste by mixing all materials together." },
      { id: "2", text: "Recycling centres reduce landfill waste and conserve natural resources." },
      { id: "3", text: "Recycling centres are only useful for large companies." },
      { id: "4", text: "Recycling centres discourage people from recycling at home." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on waste reduction and conservation. Options 1, 3, and 4 contradict the purpose described."
  },
  {
    id: "84",
    title: "The Value of Student Mentoring",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/84.mp3',
    transcript: "Audio will begin in 10 seconds... Student mentoring programs pair experienced learners with those who need guidance. Mentors offer advice, share study strategies, and provide emotional support. These programs help students build confidence and improve academic performance.",
    options: [
      { id: "1", text: "Mentoring programs reduce confidence by creating competition between students." },
      { id: "2", text: "Mentoring programs are only useful for students who struggle academically." },
      { id: "3", text: "Mentoring programs focus mainly on social activities rather than learning." },
      { id: "4", text: "Mentoring programs build confidence and support academic improvement through guidance." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on guidance and confidence. Options 1, 2, and 3 contradict the benefits described."
  },
  {
    id: "85",
    title: "The Purpose of Public Transport Maps",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/85.mp3',
    transcript: "Audio will begin in 10 seconds... Public transport maps help passengers understand routes and plan their journeys efficiently. These maps show connections between buses, trains, and other services. Clear maps make travel easier for both residents and visitors.",
    options: [
      { id: "1", text: "Transport maps help passengers plan journeys by showing routes and connections." },
      { id: "2", text: "Transport maps are unnecessary because most people already know all routes." },
      { id: "3", text: "Transport maps focus mainly on advertising local attractions." },
      { id: "4", text: "Transport maps are only useful for long‑distance travel." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on planning and clarity. Options 2, 3, and 4 contradict the purpose described."
  },
  {
    id: "86",
    title: "The Benefits of Classroom Technology",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/86.mp3',
    transcript: "Audio will begin in 10 seconds... Classroom technology such as tablets and interactive screens helps make lessons more engaging. These tools allow students to access information quickly and participate in activities more actively. Teachers use technology to support different learning styles.",
    options: [
      { id: "1", text: "Classroom technology reduces engagement by distracting students." },
      { id: "2", text: "Classroom technology is only useful for advanced subjects." },
      { id: "3", text: "Classroom technology supports engagement and different learning styles." },
      { id: "4", text: "Classroom technology focuses mainly on entertainment rather than learning." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on engagement and learning styles. Options 1, 2, and 4 contradict the benefits described."
  },
  {
    id: "87",
    title: "The Purpose of Community Centres",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/87.mp3',
    transcript: "Audio will begin in 10 seconds... Community centres offer spaces where residents can attend classes, join clubs, and participate in events. These centres help people build social connections and access useful services. Many towns invest in community centres to support local well‑being.",
    options: [
      { id: "1", text: "Community centres support well‑being by offering activities, services, and social connections." },
      { id: "2", text: "Community centres reduce participation by limiting access to activities." },
      { id: "3", text: "Community centres focus mainly on sports and avoid educational programs." },
      { id: "4", text: "Community centres are only useful for elderly residents." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on activities, services, and social connection. Options 2 and 3 contradict the broad purpose described. Option 4 limits the benefits to one group, which the passage does not support."
  },
  {
    id: "88",
    title: "The Value of Public Speaking Skills",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/88.mp3',
    transcript: "Audio will begin in 10 seconds... Public speaking skills help individuals express ideas clearly and confidently in front of an audience. These skills are useful in school, work, and community settings. Many people improve their speaking abilities through practice and feedback.",
    options: [
      { id: "1", text: "Public speaking is unnecessary because most people avoid speaking in public." },
      { id: "2", text: "Public speaking focuses mainly on memorising long speeches." },
      { id: "3", text: "Public speaking is only useful for people in leadership roles." },
      { id: "4", text: "Public speaking builds confidence and helps people communicate clearly in many settings." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s emphasis on confidence and communication. Options 1, 2, and 3 contradict or limit the benefits described."
  },
  {
    id: "89",
    title: "The Purpose of Nutrition Labels",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/89.mp3',
    transcript: "Audio will begin in 10 seconds... Nutrition labels provide information about the ingredients and nutrients in packaged foods. They help consumers make healthier choices by comparing sugar, fat, and calorie levels. Many health organisations encourage people to read labels before purchasing products.",
    options: [
      { id: "1", text: "Nutrition labels are unnecessary because all packaged foods are healthy." },
      { id: "2", text: "Nutrition labels help consumers make informed and healthier food choices." },
      { id: "3", text: "Nutrition labels focus mainly on advertising rather than information." },
      { id: "4", text: "Nutrition labels are only useful for people with medical conditions." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on informed choices. Options 1 and 3 contradict the purpose described. Option 4 limits the usefulness to a small group."
  },
  {
    id: "90",
    title: "The Benefits of Learning a Musical Instrument",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/90.mp3',
    transcript: "Audio will begin in 10 seconds... Learning a musical instrument improves coordination and strengthens memory. It also encourages creativity by allowing learners to express themselves through sound. Many teachers recommend music practice to support overall cognitive development.",
    options: [
      { id: "1", text: "Learning an instrument is unnecessary because it distracts from academic work." },
      { id: "2", text: "Learning an instrument is only useful for people who want to become musicians." },
      { id: "3", text: "Learning an instrument improves coordination, memory, and creativity." },
      { id: "4", text: "Learning an instrument focuses mainly on memorising long pieces." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on coordination, memory, and creativity. Options 1, 2, and 4 contradict or limit the benefits described."
  },
  {
    id: "91",
    title: "The Purpose of Emergency Hotlines",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/91.mp3',
    transcript: "Audio will begin in 10 seconds... Emergency hotlines allow people to report urgent situations quickly and receive immediate assistance. Operators provide guidance while emergency services travel to the location. These hotlines play a vital role in protecting public safety.",
    options: [
      { id: "1", text: "Emergency hotlines are unnecessary because emergencies rarely occur." },
      { id: "2", text: "Emergency hotlines focus mainly on giving general advice rather than urgent help." },
      { id: "3", text: "Emergency hotlines are only useful for medical professionals." },
      { id: "4", text: "Emergency hotlines provide rapid assistance and support public safety." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on rapid assistance and safety. Options 1, 2, and 3 contradict the essential purpose described."
  },
  {
    id: "92",
    title: "The Value of After‑School Programs",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/92.mp3',
    transcript: "Audio will begin in 10 seconds... After‑school programs offer students a safe place to study, socialise, and participate in activities. These programs support academic progress and help students develop new interests. Many families rely on them for structured after‑school care.",
    options: [
      { id: "1", text: "After‑school programs support learning, social development, and structured care." },
      { id: "2", text: "After‑school programs reduce learning by distracting students from homework." },
      { id: "3", text: "After‑school programs are only useful for students who struggle academically." },
      { id: "4", text: "After‑school programs focus mainly on sports and avoid academic support." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on learning, socialising, and structured care. Options 2, 3, and 4 contradict or limit the benefits described."
  },
  {
    id: "93",
    title: "The Purpose of Tourist Information Centres",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/93.mp3',
    transcript: "Audio will begin in 10 seconds... Tourist information centres help visitors learn about local attractions, transportation options, and cultural events. Staff members provide maps, recommendations, and practical advice. These centres make travel easier and more enjoyable for tourists.",
    options: [
      { id: "1", text: "Tourist information centres discourage visitors by offering limited support." },
      { id: "2", text: "Tourist information centres focus mainly on selling souvenirs." },
      { id: "3", text: "Tourist information centres help visitors navigate attractions and enjoy their stay." },
      { id: "4", text: "Tourist information centres are only useful for long‑term travellers." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on guidance and support. Options 1 and 2 contradict the purpose described. Option 4 limits the usefulness to a small group."
  },
  {
    id: "94",
    title: "The Benefits of Workplace Training",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/94.mp3',
    transcript: "Audio will begin in 10 seconds... Workplace training helps employees learn new skills and adapt to changing job requirements. It also improves teamwork by encouraging staff to collaborate during learning activities. Many companies invest in training to support long‑term growth.",
    options: [
      { id: "1", text: "Workplace training reduces productivity by distracting employees from their tasks." },
      { id: "2", text: "Workplace training builds skills and supports teamwork and long‑term growth." },
      { id: "3", text: "Workplace training is only useful for new employees." },
      { id: "4", text: "Workplace training focuses mainly on social events rather than learning." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on skills, teamwork, and growth. Options 1, 3, and 4 contradict the benefits described."
  }, {
    id: "95",
    title: "The Purpose of Local News",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/95.mp3',
    transcript: "Audio will begin in 10 seconds... Local news provides information about events, issues, and developments within a community. It helps residents stay informed about changes that may affect their daily lives. Many people rely on local news to understand what is happening around them.",
    options: [
      { id: "1", text: "Local news keeps residents informed about community events and important changes." },
      { id: "2", text: "Local news focuses mainly on national stories rather than community issues." },
      { id: "3", text: "Local news is unnecessary because people learn everything from social media." },
      { id: "4", text: "Local news is only useful for government officials." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on community information. Options 2, 3, and 4 contradict or limit the purpose described."
  },
  {
    id: "96",
    title: "The Value of Environmental Education",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/96.mp3',
    transcript: "Audio will begin in 10 seconds... Environmental education teaches people how their actions affect the planet. Lessons often include topics such as recycling, conservation, and responsible consumption. These programs encourage individuals to make sustainable choices in daily life.",
    options: [
      { id: "1", text: "Environmental education is unnecessary because nature recovers quickly." },
      { id: "2", text: "Environmental education focuses mainly on advanced scientific research." },
      { id: "3", text: "Environmental education is only useful for students studying biology." },
      { id: "4", text: "Environmental education promotes sustainable choices by explaining human impact." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on sustainability and awareness. Options 1, 2, and 3 contradict or limit the purpose described."
  },
  {
    id: "97",
    title: "The Purpose of Customer Feedback",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/97.mp3',
    transcript: "Audio will begin in 10 seconds... Customer feedback helps businesses understand what customers like and what needs improvement. Companies use this information to adjust products and services. Effective feedback systems support better customer satisfaction.",
    options: [
      { id: "1", text: "Customer feedback is unnecessary because businesses already know what people want." },
      { id: "2", text: "Customer feedback focuses mainly on advertising new products." },
      { id: "3", text: "Customer feedback helps companies improve products and increase satisfaction." },
      { id: "4", text: "Customer feedback is only useful for large companies." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on improvement and satisfaction. Options 1, 2, and 4 contradict or limit the purpose described."
  },
  {
    id: "98",
    title: "The Benefits of Outdoor Play",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/98.mp3',
    transcript: "Audio will begin in 10 seconds... Outdoor play helps children develop physical strength and social skills. Activities such as running, climbing, and playing games encourage cooperation and creativity. Many educators recommend outdoor play as part of a balanced childhood routine.",
    options: [
      { id: "1", text: "Outdoor play supports physical development and encourages cooperation and creativity." },
      { id: "2", text: "Outdoor play is unnecessary because indoor activities are safer." },
      { id: "3", text: "Outdoor play focuses mainly on competitive sports." },
      { id: "4", text: "Outdoor play is only useful for children who enjoy physical activity." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on physical and social development. Options 2, 3, and 4 contradict or limit the benefits described."
  },
  {
    id: "99",
    title: "The Purpose of Public Surveys",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/99.mp3',
    transcript: "Audio will begin in 10 seconds... Public surveys collect opinions from residents about community issues and services. Governments use survey results to understand public needs and plan improvements. These surveys help ensure that decisions reflect the views of the community.",
    options: [
      { id: "1", text: "Public surveys reduce community involvement by limiting participation." },
      { id: "2", text: "Public surveys help governments understand community needs and plan improvements." },
      { id: "3", text: "Public surveys focus mainly on advertising new services." },
      { id: "4", text: "Public surveys are only useful for large cities." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on understanding needs and planning improvements. Options 1, 3, and 4 contradict or limit the purpose described."
  },
  {
    id: "100",
    title: "The Value of Science Museums",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/100.mp3',
    transcript: "Audio will begin in 10 seconds... Science museums offer interactive exhibits that help visitors understand scientific concepts. These hands‑on experiences make learning more engaging for both children and adults. Many museums design exhibits to spark curiosity and encourage exploration.",
    options: [
      { id: "1", text: "Science museums reduce interest in science by presenting complex information." },
      { id: "2", text: "Science museums focus mainly on storing old scientific equipment." },
      { id: "3", text: "Science museums are only useful for students studying science." },
      { id: "4", text: "Science museums make learning engaging through interactive and exploratory exhibits." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on interactive learning. Options 1, 2, and 3 contradict or limit the benefits described."
  },
  {
    id: "101",
    title: "The Purpose of Local Workshops",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/101.mp3',
    transcript: "Audio will begin in 10 seconds... Local workshops provide opportunities for people to learn new skills such as cooking, photography, or basic repairs. These sessions are often led by community experts who share practical knowledge. Workshops help residents build confidence and develop useful abilities.",
    options: [
      { id: "1", text: "Local workshops reduce learning by offering limited activities." },
      { id: "2", text: "Local workshops focus mainly on entertainment rather than skill development." },
      { id: "3", text: "Local workshops teach practical skills and build confidence through guided learning." },
      { id: "4", text: "Local workshops are only useful for professional learners." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on practical skills and confidence. Options 1, 2, and 4 contradict or limit the purpose described."
  },
  {
    id: "102",
    title: "The Benefits of Water Conservation",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/102.mp3',
    transcript: "Audio will begin in 10 seconds... Water conservation helps protect limited water supplies by encouraging responsible use. Simple actions such as fixing leaks and reducing shower time can save large amounts of water. Many communities promote conservation to ensure long‑term sustainability.",
    options: [
      { id: "1", text: "Water conservation protects limited supplies through responsible daily habits." },
      { id: "2", text: "Water conservation is unnecessary because water is always available." },
      { id: "3", text: "Water conservation focuses mainly on industrial use rather than households." },
      { id: "4", text: "Water conservation is only useful during emergencies." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on responsible use and sustainability. Options 2, 3, and 4 contradict or limit the purpose described."
  },
  {
    id: "103",
    title: "The Purpose of Digital Calendars",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/103.mp3',
    transcript: "Audio will begin in 10 seconds... Digital calendars help people organise appointments, deadlines, and daily tasks in one place. They send reminders that reduce the chance of forgetting important events. Many users rely on digital calendars to manage busy schedules more effectively.",
    options: [
      { id: "1", text: "Digital calendars help people stay organised by tracking tasks and sending reminders." },
      { id: "2", text: "Digital calendars are unnecessary because most people remember events easily." },
      { id: "3", text: "Digital calendars focus mainly on sharing personal information online." },
      { id: "4", text: "Digital calendars are only useful for people working in large companies." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on organisation and reminders. Options 2 and 3 contradict the purpose described. Option 4 limits the usefulness to a small group, which the passage does not support."
  },
  {
    id: "104",
    title: "The Value of Community Sports",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/104.mp3',
    transcript: "Audio will begin in 10 seconds... Community sports programs encourage people of all ages to stay active and build social connections. These programs offer structured activities that promote teamwork and healthy habits. Many towns support community sports to improve overall well‑being.",
    options: [
      { id: "1", text: "Community sports reduce participation by focusing only on competition." },
      { id: "2", text: "Community sports are only useful for young athletes." },
      { id: "3", text: "Community sports focus mainly on professional training." },
      { id: "4", text: "Community sports promote activity, teamwork, and social connection for all ages." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s emphasis on activity and teamwork. Options 1, 2, and 3 contradict or limit the benefits described."
  },
  {
    id: "105",
    title: "The Purpose of Travel Guides",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/105.mp3',
    transcript: "Audio will begin in 10 seconds... Travel guides provide essential information about destinations, including attractions, transportation, and cultural tips. They help travellers plan their trips and avoid common difficulties. Many people use travel guides to make their journeys smoother and more enjoyable.",
    options: [
      { id: "1", text: "Travel guides reduce enjoyment by overwhelming travellers with information." },
      { id: "2", text: "Travel guides help travellers plan trips and avoid common difficulties." },
      { id: "3", text: "Travel guides focus mainly on selling expensive tours." },
      { id: "4", text: "Travel guides are only useful for long‑term travellers." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on planning and avoiding difficulties. Options 1, 3, and 4 contradict or limit the purpose described."
  },
  {
    id: "106",
    title: "The Benefits of Online Forums",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/106.mp3',
    transcript: "Audio will begin in 10 seconds... Online forums allow people to share experiences and ask questions about common interests. These platforms help users learn from one another and find solutions to everyday problems. Many communities rely on forums to exchange practical advice.",
    options: [
      { id: "1", text: "Online forums reduce communication by limiting user interaction." },
      { id: "2", text: "Online forums focus mainly on entertainment rather than information." },
      { id: "3", text: "Online forums help people share experiences and find practical solutions." },
      { id: "4", text: "Online forums are only useful for technical discussions." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on shared experiences and problem‑solving. Options 1, 2, and 4 contradict or limit the benefits described."
  },
  {
    id: "107",
    title: "The Purpose of Local Recycling Rules",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/107.mp3',
    transcript: "Audio will begin in 10 seconds... Local recycling rules explain how residents should sort materials such as paper, plastic, and glass. Clear guidelines help reduce contamination and improve recycling efficiency. Communities use these rules to support environmental sustainability.",
    options: [
      { id: "1", text: "Recycling rules guide residents in sorting materials to support sustainability." },
      { id: "2", text: "Recycling rules are unnecessary because all waste is processed together." },
      { id: "3", text: "Recycling rules focus mainly on increasing waste collection fees." },
      { id: "4", text: "Recycling rules are only useful for large apartment buildings." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on sorting and sustainability. Options 2, 3, and 4 contradict or limit the purpose described."
  },
  {
    id: "108",
    title: "The Value of Workplace Mentors",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/108.mp3',
    transcript: "Audio will begin in 10 seconds... Workplace mentors guide new employees by sharing knowledge and offering practical advice. They help newcomers understand expectations and develop confidence in their roles. Many companies use mentoring programs to support long‑term employee success.",
    options: [
      { id: "1", text: "Workplace mentors reduce confidence by creating unnecessary pressure." },
      { id: "2", text: "Workplace mentors focus mainly on evaluating employee performance." },
      { id: "3", text: "Workplace mentors are only useful for senior staff." },
      { id: "4", text: "Workplace mentors support new employees by offering guidance and building confidence." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on guidance and confidence. Options 1, 2, and 3 contradict or limit the benefits described."
  },
  {
    id: "109",
    title: "The Purpose of Local History Museums",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/109.mp3',
    transcript: "Audio will begin in 10 seconds... Local history museums preserve artifacts and stories that show how communities have changed over time. Exhibits help visitors understand important events and cultural traditions. These museums play a key role in protecting regional heritage.",
    options: [
      { id: "1", text: "Local history museums focus mainly on modern technology." },
      { id: "2", text: "Local history museums are unnecessary because history is rarely studied." },
      { id: "3", text: "Local history museums preserve heritage and help visitors understand community traditions." },
      { id: "4", text: "Local history museums are only useful for academic researchers." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on heritage and understanding. Options 1, 2, and 4 contradict or limit the purpose described."
  },
  {
    id: "110",
    title: "The Benefits of Time‑Tracking Apps",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/110.mp3',
    transcript: "Audio will begin in 10 seconds... Time‑tracking apps help users monitor how they spend their hours throughout the day. These tools highlight patterns that can improve productivity and reduce wasted time. Many people use them to manage work and personal tasks more effectively.",
    options: [
      { id: "1", text: "Time‑tracking apps help users improve productivity by showing how time is spent." },
      { id: "2", text: "Time‑tracking apps reduce productivity by creating unnecessary pressure." },
      { id: "3", text: "Time‑tracking apps focus mainly on sharing personal data publicly." },
      { id: "4", text: "Time‑tracking apps are only useful for large companies." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on productivity and awareness. Options 2, 3, and 4 contradict or limit the benefits described."
  },
  {
    id: "111",
    title: "The Purpose of Public Art Installations",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/111.mp3',
    transcript: "Audio will begin in 10 seconds... Public art installations bring creativity into shared spaces such as parks and city squares. They encourage people to reflect on cultural themes and engage with their surroundings. Many cities use public art to strengthen community identity.",
    options: [
      { id: "1", text: "Public art installations reduce community identity by distracting residents." },
      { id: "2", text: "Public art installations encourage reflection and strengthen community identity." },
      { id: "3", text: "Public art installations are only useful for professional artists." },
      { id: "4", text: "Public art installations focus mainly on advertising local businesses." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on reflection and identity. Options 1, 3, and 4 contradict or limit the purpose described."
  },
  {
    id: "112",
    title: "The Value of Online Tutorials",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/112.mp3',
    transcript: "Audio will begin in 10 seconds... Online tutorials provide step‑by‑step guidance on a wide range of topics, from cooking to computer skills. They allow learners to study at their own pace and revisit lessons when needed. Many people use tutorials to develop practical abilities.",
    options: [
      { id: "1", text: "Online tutorials reduce learning by offering unclear instructions." },
      { id: "2", text: "Online tutorials are only useful for advanced learners." },
      { id: "3", text: "Online tutorials focus mainly on entertainment rather than education." },
      { id: "4", text: "Online tutorials support practical learning through flexible, step‑by‑step guidance." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on flexibility and practical learning. Options 1, 2, and 3 contradict or limit the benefits described."
  },
  {
    id: "113",
    title: "The Purpose of Local Volunteer Groups",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/113.mp3',
    transcript: "Audio will begin in 10 seconds... Local volunteer groups organise activities that support community needs, such as cleaning parks or helping elderly residents. These groups encourage teamwork and strengthen neighbourhood relationships. Many communities rely on volunteers to maintain shared spaces.",
    options: [
      { id: "1", text: "Volunteer groups support community needs and strengthen neighbourhood relationships." },
      { id: "2", text: "Volunteer groups reduce participation by limiting activities." },
      { id: "3", text: "Volunteer groups focus mainly on raising money for businesses." },
      { id: "4", text: "Volunteer groups are only useful for large cities." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on community support and teamwork. Options 2, 3, and 4 contradict or limit the purpose described."
  },
  {
    id: "114",
    title: "The Benefits of Digital Note‑Taking",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/114.mp3',
    transcript: "Audio will begin in 10 seconds... Digital note‑taking tools allow users to organise information efficiently and access notes across multiple devices. Features such as search functions and cloud storage make studying and planning easier. Many students prefer digital notes for convenience.",
    options: [
      { id: "1", text: "Digital note‑taking reduces organisation by scattering information." },
      { id: "2", text: "Digital note‑taking is only useful for professional researchers." },
      { id: "3", text: "Digital note‑taking improves organisation and makes information easier to access." },
      { id: "4", text: "Digital note‑taking focuses mainly on entertainment features." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on organisation and accessibility. Options 1, 2, and 4 contradict or limit the benefits described."
  },
  {
    id: "115",
    title: "The Purpose of Local Clean‑Up Events",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/115.mp3',
    transcript: "Audio will begin in 10 seconds... Local clean‑up events bring residents together to remove litter from parks, beaches, and streets. These activities improve the appearance of public spaces and promote environmental responsibility. Many communities organise clean‑ups to encourage civic pride.",
    options: [
      { id: "1", text: "Clean‑up events reduce community involvement by limiting participation." },
      { id: "2", text: "Clean‑up events improve public spaces and promote environmental responsibility." },
      { id: "3", text: "Clean‑up events focus mainly on raising money for local businesses." },
      { id: "4", text: "Clean‑up events are only useful for large cities." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on environmental responsibility and community pride. Options 1, 3, and 4 contradict or limit the purpose described."
  },
  {
    id: "116",
    title: "The Value of Study Groups",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/116.mp3',
    transcript: "Audio will begin in 10 seconds... Study groups allow students to review material together and clarify difficult concepts. Working in groups encourages discussion and helps learners stay motivated. Many teachers recommend study groups to support deeper understanding.",
    options: [
      { id: "1", text: "Study groups reduce learning by creating confusion among students." },
      { id: "2", text: "Study groups are only useful for advanced learners." },
      { id: "3", text: "Study groups focus mainly on socialising rather than studying." },
      { id: "4", text: "Study groups support understanding by encouraging discussion and motivation." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s focus on discussion and motivation. Options 1, 2, and 3 contradict or limit the benefits described."
  },
  {
    id: "117",
    title: "The Purpose of Local Workshops",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/117.mp3',
    transcript: "Audio will begin in 10 seconds... Local workshops offer hands‑on learning experiences in areas such as art, cooking, and technology. Participants gain practical skills while receiving guidance from experienced instructors. These workshops help people explore new interests in a supportive environment.",
    options: [
      { id: "1", text: "Local workshops reduce learning by offering limited instruction." },
      { id: "2", text: "Local workshops are only useful for professional artists." },
      { id: "3", text: "Local workshops teach practical skills and encourage exploration of new interests." },
      { id: "4", text: "Local workshops focus mainly on competitive activities." }
    ],
    correctOption: "3",
    explanation: "Option 3 summarises the transcript’s focus on practical skills and exploration. Options 1, 2, and 4 contradict or limit the purpose described."
  },
  {
    id: "118",
    title: "The Benefits of Healthy Hydration",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/118.mp3',
    transcript: "Audio will begin in 10 seconds... Staying hydrated helps the body function properly by supporting digestion, circulation, and temperature control. Drinking enough water throughout the day also improves concentration and reduces fatigue. Health experts recommend regular hydration as part of a balanced lifestyle.",
    options: [
      { id: "1", text: "Hydration is unnecessary because the body can function without regular water intake." },
      { id: "2", text: "Hydration supports essential body functions and improves concentration throughout the day." },
      { id: "3", text: "Hydration is only important for people who exercise frequently." },
      { id: "4", text: "Hydration focuses mainly on reducing appetite rather than supporting health." }
    ],
    correctOption: "2",
    explanation: "Option 2 summarises the transcript’s focus on body function and concentration. Options 1 and 4 contradict the health benefits described. Option 3 limits hydration to athletes, which the passage does not suggest."
  },
  {
    id: "119",
    title: "The Purpose of Local Walking Trails",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/119.mp3',
    transcript: "Audio will begin in 10 seconds... Local walking trails provide safe and accessible routes for exercise and relaxation. These paths encourage residents to spend more time outdoors and enjoy natural surroundings. Many communities maintain walking trails to promote healthier lifestyles.",
    options: [
      { id: "1", text: "Walking trails promote outdoor activity and support healthier lifestyles in the community." },
      { id: "2", text: "Walking trails reduce outdoor activity by limiting where people can walk." },
      { id: "3", text: "Walking trails are only useful for experienced hikers." },
      { id: "4", text: "Walking trails focus mainly on connecting shopping areas." }
    ],
    correctOption: "1",
    explanation: "Option 1 summarises the transcript’s focus on outdoor activity and health. Options 2 and 4 contradict the purpose described. Option 3 limits the benefits to a small group, which the passage does not support."
  },
  {
    id: "120",
    title: "The Value of Online Language Exchanges",
    question: "Select the correct summary:",
    audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/120.mp3',
    transcript: "Audio will begin in 10 seconds... Online language exchanges connect learners from different countries who want to practise speaking. Participants help one another by sharing vocabulary, correcting mistakes, and discussing cultural topics. These exchanges create a supportive environment for improving communication skills.",
    options: [
      { id: "1", text: "Language exchanges reduce learning by creating confusion between learners." },
      { id: "2", text: "Language exchanges are only useful for advanced speakers." },
      { id: "3", text: "Language exchanges focus mainly on grammar tests rather than conversation." },
      { id: "4", text: "Language exchanges support communication skills through shared practice and cultural discussion." }
    ],
    correctOption: "4",
    explanation: "Option 4 summarises the transcript’s emphasis on shared practice and communication. Options 1, 2, and 3 contradict or limit the benefits described."
  },

  //C1 (121-136)
 {
  id: "121",
  title: "The Impact of Remote Collaboration",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/121.mp3',
  transcript: "Audio will begin in 10 seconds... Remote collaboration has reshaped how organisations coordinate complex projects across multiple time zones. Digital platforms now allow teams to share data instantly and maintain continuous communication. These developments have expanded opportunities for global cooperation.",
  options: [
    { id: "1", text: "Remote collaboration limits communication by reducing access to shared tools." },
    { id: "2", text: "Remote collaboration is only effective for small teams working on simple tasks." },
    { id: "3", text: "Remote collaboration enables global teams to coordinate efficiently through digital tools." },
    { id: "4", text: "Remote collaboration discourages international cooperation by creating scheduling conflicts." }
  ],
  correctOption: "3",
  explanation: "Option 3 captures the transcript’s emphasis on global coordination and digital tools. Options 1 and 4 contradict the described advantages. Option 2 restricts the benefits to small teams, which the passage does not suggest."
},
{
  id: "122",
  title: "The Role of Citizen Journalism",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/122.mp3',
  transcript: "Audio will begin in 10 seconds... Citizen journalism has gained prominence as individuals use mobile devices to document events in real time. This form of reporting can highlight issues overlooked by traditional media. However, it also raises questions about accuracy and verification.",
  options: [
    { id: "1", text: "Citizen journalism expands public reporting but raises concerns about accuracy." },
    { id: "2", text: "Citizen journalism eliminates the need for professional news organisations." },
    { id: "3", text: "Citizen journalism focuses mainly on entertainment rather than information." },
    { id: "4", text: "Citizen journalism is discouraged because mobile devices are unreliable." }
  ],
  correctOption: "1",
  explanation: "Option 1 summarises both the benefits and concerns presented. Options 2 and 3 misrepresent the role of citizen journalism. Option 4 introduces an unsupported claim about device reliability."
},
{
  id: "123",
  title: "The Evolution of Public Libraries",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/123.mp3',
  transcript: "Audio will begin in 10 seconds... Public libraries have expanded their services beyond lending books to include digital archives, community workshops, and technology access. These changes reflect shifting expectations about how knowledge should be shared. Libraries now function as inclusive learning hubs for diverse populations.",
  options: [
    { id: "1", text: "Libraries are reducing services because fewer people borrow books." },
    { id: "2", text: "Libraries now focus exclusively on digital collections rather than community programs." },
    { id: "3", text: "Libraries are becoming private institutions that limit public access." },
    { id: "4", text: "Libraries have evolved into inclusive learning hubs offering a wide range of services." }
  ],
  correctOption: "4",
  explanation: "Option 4 reflects the transcript’s emphasis on expanded services and inclusivity. Options 1 and 3 contradict the described developments. Option 2 oversimplifies the shift by ignoring community‑based initiatives."
},
{
  id: "124",
  title: "The Influence of Algorithmic Recommendations",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/124.mp3',
  transcript: "Audio will begin in 10 seconds... Algorithmic recommendation systems shape what users encounter online by analysing their behaviour and preferences. While these systems can personalise content effectively, they may also reinforce narrow viewpoints. Researchers continue to debate how to balance convenience with diversity of information.",
  options: [
    { id: "1", text: "Recommendation systems eliminate bias by exposing users to diverse viewpoints." },
    { id: "2", text: "Recommendation systems personalise content but risk reinforcing limited perspectives." },
    { id: "3", text: "Recommendation systems are ineffective because they cannot analyse user behaviour." },
    { id: "4", text: "Recommendation systems focus mainly on promoting advertisements." }
  ],
  correctOption: "2",
  explanation: "Option 2 summarises both the benefits and risks described. Options 1 and 3 contradict the transcript. Option 4 narrows the purpose of recommendation systems beyond what is stated."
},
{
  id: "125",
  title: "The Rise of Micro‑Credentials",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/125.mp3',
  transcript: "Audio will begin in 10 seconds... Micro‑credentials offer targeted training in specialised skills, allowing learners to update their knowledge quickly. Employers increasingly recognise these qualifications as evidence of practical competence. This trend reflects a broader shift toward flexible, skills‑based education.",
  options: [
    { id: "1", text: "Micro‑credentials are replacing all traditional degrees in higher education." },
    { id: "2", text: "Micro‑credentials focus mainly on recreational hobbies rather than professional skills." },
    { id: "3", text: "Micro‑credentials are discouraged because employers do not value them." },
    { id: "4", text: "Micro‑credentials provide focused skill development and are gaining employer recognition." }
  ],
  correctOption: "4",
  explanation: "Option 4 summarises the transcript’s emphasis on targeted skills and employer acceptance. Options 1, 2, and 3 contradict the described trend."
},
{
  id: "126",
  title: "The Challenges of Urban Sustainability",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/126.mp3',
  transcript: "Audio will begin in 10 seconds... Urban sustainability requires balancing economic growth with environmental protection and social equity. Cities must address issues such as pollution, housing shortages, and resource management. Policymakers increasingly emphasise long‑term planning to create resilient urban environments.",
  options: [
    { id: "1", text: "Urban sustainability demands long‑term planning to balance environmental, social, and economic needs." },
    { id: "2", text: "Urban sustainability focuses mainly on increasing economic growth at any cost." },
    { id: "3", text: "Urban sustainability is unnecessary because cities naturally regulate themselves." },
    { id: "4", text: "Urban sustainability requires abandoning all forms of development." }
  ],
  correctOption: "1",
  explanation: "Option 1 captures the transcript’s emphasis on balance and long‑term planning. Options 2 and 3 contradict the challenges described. Option 4 misrepresents sustainability as anti‑development."
},
{
  id: "127",
  title: "The Role of Scientific Communication",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/127.mp3',
  transcript: "Audio will begin in 10 seconds... Scientific communication aims to make complex research accessible to non‑experts without oversimplifying key findings. Effective communication builds public trust and encourages informed decision‑making. Many researchers now receive training to improve how they present their work.",
  options: [
    { id: "1", text: "Scientific communication reduces accuracy by removing essential details." },
    { id: "2", text: "Scientific communication is only relevant for journalists, not researchers." },
    { id: "3", text: "Scientific communication helps the public understand research while maintaining accuracy." },
    { id: "4", text: "Scientific communication discourages public engagement by complicating information." }
  ],
  correctOption: "3",
  explanation: "Option 3 summarises the transcript’s focus on accessibility and accuracy. Options 1 and 4 contradict the purpose described. Option 2 ignores the growing role of researchers in communication."
},
{
  id: "128",
  title: "The Expansion of Telemedicine",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/128.mp3',
  transcript: "Audio will begin in 10 seconds... Telemedicine has expanded rapidly as digital tools allow patients to consult healthcare professionals remotely. This approach increases access for individuals in rural or underserved areas. However, it also requires reliable technology and clear communication to ensure effective care.",
  options: [
    { id: "1", text: "Telemedicine eliminates the need for in‑person medical care entirely." },
    { id: "2", text: "Telemedicine expands access to care but depends on reliable technology and communication." },
    { id: "3", text: "Telemedicine is only useful for minor health concerns." },
    { id: "4", text: "Telemedicine reduces access for rural communities due to limited digital tools." }
  ],
  correctOption: "2",
  explanation: "Option 2 summarises both the advantages and limitations described. Options 1 and 4 contradict the transcript. Option 3 restricts telemedicine’s usefulness beyond what is stated."
},
{
  id: "129",
  title: "The Ethics of Artificial Intelligence",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/129.mp3',
  transcript: "Audio will begin in 10 seconds... Artificial intelligence raises ethical questions about transparency, accountability, and potential bias in automated decisions. Researchers argue that responsible development requires clear guidelines and ongoing evaluation. These discussions aim to ensure that AI systems serve the public interest.",
  options: [
    { id: "1", text: "AI ethics focuses on transparency, accountability, and ensuring systems serve the public interest." },
    { id: "2", text: "AI ethics is unnecessary because automated systems are naturally unbiased." },
    { id: "3", text: "AI ethics focuses mainly on replacing human decision‑makers." },
    { id: "4", text: "AI ethics discourages innovation by limiting technological development." }
  ],
  correctOption: "1",
  explanation: "Option 1 summarises the transcript’s emphasis on guidelines and public interest. Options 2, 3, and 4 contradict or oversimplify the ethical concerns described."
},
{
  id: "130",
  title: "The Importance of Cultural Preservation",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/130.mp3',
  transcript: "Audio will begin in 10 seconds... Cultural preservation involves safeguarding traditions, languages, and historical sites that define a community’s identity. Globalisation has increased the urgency of protecting these elements from disappearance. Many organisations now work to document and revitalise endangered cultural practices.",
  options: [
    { id: "1", text: "Cultural preservation is unnecessary because traditions naturally survive over time." },
    { id: "2", text: "Cultural preservation focuses mainly on promoting tourism." },
    { id: "3", text: "Cultural preservation discourages cultural exchange by isolating communities." },
    { id: "4", text: "Cultural preservation protects traditions and languages threatened by globalisation." }
  ],
  correctOption: "4",
  explanation: "Option 4 summarises the transcript’s focus on protection and urgency. Options 1, 2, and 3 contradict or misrepresent the purpose described."
},
{
  id: "131",
  title: "The Rise of Open‑Access Research",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/131.mp3',
  transcript: "Audio will begin in 10 seconds... Audio will begin in 10 seconds...Open‑access publishing allows researchers to share their findings freely without paywalls. This model increases global access to scientific knowledge and accelerates academic collaboration. Critics, however, argue that funding models must be carefully managed to maintain quality.",
  options: [
    { id: "1", text: "Open‑access publishing reduces collaboration by restricting access to research." },
    { id: "2", text: "Open‑access publishing focuses mainly on entertainment rather than academic work." },
    { id: "3", text: "Open‑access publishing expands access to research while raising questions about funding models." },
    { id: "4", text: "Open‑access publishing eliminates the need for peer review." }
  ],
  correctOption: "3",
  explanation: "Option 3 summarises both the benefits and concerns described. Options 1 and 2 contradict the transcript. Option 4 introduces an unsupported claim about peer review."
},
{
  id: "132",
  title: "The Impact of Climate Migration",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/132.mp3',
  transcript: "Audio will begin in 10 seconds... Climate migration occurs when environmental changes force communities to relocate. Rising sea levels, extreme weather, and resource shortages contribute to this growing challenge. Policymakers must address both humanitarian needs and long‑term adaptation strategies.",
  options: [
    { id: "1", text: "Climate migration is rare and has little connection to environmental change." },
    { id: "2", text: "Climate migration results from environmental pressures and requires coordinated policy responses." },
    { id: "3", text: "Climate migration focuses mainly on tourism‑related relocation." },
    { id: "4", text: "Climate migration can be solved entirely through short‑term emergency aid." }
  ],
  correctOption: "2",
  explanation: "Option 2 summarises the transcript’s emphasis on environmental causes and policy needs. Options 1 and 3 contradict the passage. Option 4 oversimplifies the long‑term challenge."
},
{
  id: "133",
  title: "The Role of Data Visualisation",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/133.mp3',
  transcript: "Audio will begin in 10 seconds... Data visualisation transforms complex information into clear, interpretable graphics that support decision‑making. Effective visualisation highlights patterns that might be overlooked in raw data. As datasets grow larger, visual tools have become essential for analysis.",
  options: [
    { id: "1", text: "Data visualisation clarifies complex information and reveals patterns that aid decision‑making." },
    { id: "2", text: "Data visualisation is unnecessary because raw data is always easy to interpret." },
    { id: "3", text: "Data visualisation focuses mainly on artistic design rather than analysis." },
    { id: "4", text: "Data visualisation is only useful for small datasets." }
  ],
  correctOption: "1",
  explanation: "Option 1 summarises the transcript’s focus on clarity and pattern recognition. Options 2, 3, and 4 contradict or limit the purpose described."
},
{
  id: "134",
  title: "The Expansion of Sustainable Architecture",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/134.mp3',
  transcript: "Audio will begin in 10 seconds... Sustainable architecture integrates energy‑efficient materials and designs that minimise environmental impact. Architects increasingly prioritise renewable energy, natural lighting, and reduced waste. These practices aim to create buildings that are both functional and environmentally responsible.",
  options: [
    { id: "1", text: "Sustainable architecture discourages innovation by limiting design options." },
    { id: "2", text: "Sustainable architecture focuses mainly on decorative features." },
    { id: "3", text: "Sustainable architecture is only relevant for large commercial buildings." },
    { id: "4", text: "Sustainable architecture reduces environmental impact through efficient materials and design." }
  ],
  correctOption: "4",
  explanation: "Option 4 summarises the transcript’s emphasis on efficiency and environmental responsibility. Options 1, 2, and 3 contradict or limit the described practices."
},
{
  id: "135",
  title: "The Importance of Media Literacy",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/135.mp3',
  transcript: "Audio will begin in 10 seconds... Media literacy equips individuals with the skills to evaluate information critically and recognise misleading content. As digital platforms expand, the ability to assess credibility has become increasingly essential. Educators promote media literacy to support informed civic participation.",
  options: [
    { id: "1", text: "Media literacy reduces critical thinking by encouraging passive consumption." },
    { id: "2", text: "Media literacy focuses mainly on teaching technical computer skills." },
    { id: "3", text: "Media literacy helps people evaluate information and recognise misleading content." },
    { id: "4", text: "Media literacy is unnecessary because most online information is reliable." }
  ],
  correctOption: "3",
  explanation: "Option 3 summarises the transcript’s focus on evaluation and credibility. Options 1, 2, and 4 contradict the purpose described."
},

//C2 (136-150)
 {
  id: "136",
  title: "The Fragility of Global Supply Chains",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/136.mp3',
  transcript: "Audio will begin in 10 seconds... Recent disruptions have revealed how vulnerable global supply chains are to political tensions, natural disasters, and logistical bottlenecks. Companies are now reassessing their dependence on single‑source suppliers to reduce systemic risk. This shift reflects a broader effort to build resilience into international trade networks.",
  options: [
    { id: "1", text: "Supply chains remain stable despite political and environmental pressures." },
    { id: "2", text: "Supply chains are abandoning international trade in favour of local production." },
    { id: "3", text: "Supply chains are unaffected by disruptions due to strong global coordination." },
    { id: "4", text: "Supply chains are being redesigned to reduce vulnerability and increase resilience." }
  ],
  correctOption: "4",
  explanation: "Option 4 captures the transcript’s emphasis on reassessment and resilience. Options 1 and 3 contradict the described vulnerabilities. Option 2 overstates the shift by implying a complete abandonment of global trade."
},
{
  id: "137",
  title: "The Ethics of Predictive Policing",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/137.mp3',
  transcript: "Audio will begin in 10 seconds... Predictive policing uses data‑driven algorithms to anticipate criminal activity, but critics argue that these systems may reinforce existing social biases. Supporters claim the technology can allocate resources more efficiently. The debate highlights the tension between innovation and fairness in law enforcement.",
  options: [
    { id: "1", text: "Predictive policing offers efficiency but raises concerns about bias and fairness." },
    { id: "2", text: "Predictive policing eliminates bias by relying solely on objective data." },
    { id: "3", text: "Predictive policing is widely accepted as the most ethical form of law enforcement." },
    { id: "4", text: "Predictive policing focuses mainly on reducing the need for human officers." }
  ],
  correctOption: "1",
  explanation: "Option 1 summarises both the potential benefits and ethical concerns. Options 2 and 3 misrepresent the debate. Option 4 introduces an unsupported claim about replacing officers."
},
{
  id: "138",
  title: "The Decline of Traditional Broadcasting",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/138.mp3',
  transcript: "Audio will begin in 10 seconds... Traditional broadcasting has lost influence as audiences migrate to on‑demand digital platforms. This shift has forced broadcasters to rethink their programming strategies and adopt more interactive formats. The transformation reflects changing expectations about how media should be consumed.",
  options: [
    { id: "1", text: "Traditional broadcasting is expanding rapidly due to increased viewer loyalty." },
    { id: "2", text: "Traditional broadcasting now focuses exclusively on live sports coverage." },
    { id: "3", text: "Traditional broadcasting is adapting to digital competition by rethinking formats." },
    { id: "4", text: "Traditional broadcasting remains unchanged despite digital disruption." }
  ],
  correctOption: "3",
  explanation: "Option 3 reflects the transcript’s emphasis on adaptation and shifting expectations. Options 1 and 4 contradict the described decline. Option 2 narrows the focus beyond what is stated."
},
{
  id: "139",
  title: "The Complexity of Climate Governance",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/139.mp3',
  transcript: "Audio will begin in 10 seconds... Climate governance requires cooperation among nations with vastly different economic priorities and environmental vulnerabilities. Negotiations often stall because countries disagree on responsibility and financial commitments. These challenges illustrate the difficulty of creating unified global policies.",
  options: [
    { id: "1", text: "Climate governance is straightforward because all nations share identical priorities." },
    { id: "2", text: "Climate governance is hindered by conflicting national interests and financial disputes." },
    { id: "3", text: "Climate governance focuses mainly on enforcing strict penalties for non‑compliance." },
    { id: "4", text: "Climate governance has been fully resolved through recent international agreements." }
  ],
  correctOption: "2",
  explanation: "Option 2 summarises the transcript’s emphasis on conflicting priorities and stalled negotiations. Options 1 and 4 contradict the described challenges. Option 3 introduces penalties not mentioned in the passage."
},
{
  id: "140",
  title: "The Rise of Autonomous Research Tools",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/140.mp3',
  transcript: "Audio will begin in 10 seconds... Autonomous research tools can analyse vast datasets, generate hypotheses, and even design experiments with minimal human input. While these systems accelerate scientific discovery, they also raise questions about oversight and accountability. Researchers are debating how to integrate automation responsibly.",
  options: [
    { id: "1", text: "Autonomous tools eliminate the need for human researchers entirely." },
    { id: "2", text: "Autonomous tools slow scientific progress by complicating data analysis." },
    { id: "3", text: "Autonomous tools are discouraged because they cannot generate hypotheses." },
    { id: "4", text: "Autonomous tools accelerate discovery but require careful oversight and accountability." }
  ],
  correctOption: "4",
  explanation: "Option 4 summarises both the benefits and concerns described. Options 1, 2, and 3 contradict the transcript’s explanation of capabilities."
},
{
  id: "141",
  title: "The Economics of Digital Monopolies",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/141.mp3',
  transcript: "Audio will begin in 10 seconds... Digital monopolies emerge when a small number of platforms dominate online markets, often due to network effects and data advantages. Critics argue that such concentration limits competition and innovation. Policymakers are exploring regulatory frameworks to address these imbalances.",
  options: [
    { id: "1", text: "Digital monopolies encourage competition by distributing market power evenly." },
    { id: "2", text: "Digital monopolies restrict competition, prompting policymakers to consider regulation." },
    { id: "3", text: "Digital monopolies are disappearing as new platforms rapidly replace them." },
    { id: "4", text: "Digital monopolies focus mainly on improving user privacy." }
  ],
  correctOption: "2",
  explanation: "Option 2 summarises the transcript’s focus on concentration and regulation. Options 1 and 3 contradict the described market dynamics. Option 4 introduces a privacy focus not mentioned."
},
{
  id: "142",
  title: "The Philosophy of Technological Progress",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/142.mp3',
  transcript: "Audio will begin in 10 seconds... Debates about technological progress often centre on whether innovation inherently improves human well‑being or merely amplifies existing inequalities. Philosophers argue that progress must be evaluated not only by efficiency but also by its social consequences. This perspective encourages a more critical approach to technological adoption.",
  options: [
    { id: "1", text: "Technological progress must be judged by its social consequences, not just efficiency." },
    { id: "2", text: "Technological progress inevitably improves human well‑being regardless of context." },
    { id: "3", text: "Technological progress focuses mainly on replacing human labour." },
    { id: "4", text: "Technological progress is irrelevant to philosophical discussions." }
  ],
  correctOption: "1",
  explanation: "Option 1 summarises the transcript’s emphasis on evaluating social impact. Options 2 and 4 contradict the philosophical debate. Option 3 narrows the discussion beyond what is stated."
},
{
  id: "143",
  title: "The Dynamics of Knowledge Transfer",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/143.mp3',
  transcript: "Audio will begin in 10 seconds... Knowledge transfer within organisations depends on trust, shared language, and opportunities for collaboration. When these elements are absent, valuable expertise often remains isolated. Effective knowledge transfer strategies aim to bridge these gaps and strengthen institutional learning.",
  options: [
    { id: "1", text: "Knowledge transfer occurs naturally and requires no organisational support." },
    { id: "2", text: "Knowledge transfer focuses mainly on documenting information rather than sharing it." },
    { id: "3", text: "Knowledge transfer relies on trust and collaboration to prevent expertise from becoming isolated." },
    { id: "4", text: "Knowledge transfer is only relevant in academic institutions." }
  ],
  correctOption: "3",
  explanation: "Option 3 summarises the transcript’s focus on trust and collaboration. Options 1 and 2 contradict the described challenges. Option 4 limits the concept to academia, which the passage does not imply."
},
{
  id: "144",
  title: "The Challenges of Space Governance",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/144.mp3',
  transcript: "Audio will begin in 10 seconds... As commercial and national actors expand their presence in space, questions arise about resource rights, orbital congestion, and long‑term sustainability. Existing treaties offer limited guidance for modern activities. Policymakers are now considering new frameworks to manage shared space environments responsibly.",
  options: [
    { id: "1", text: "Space governance is straightforward because treaties already address all modern concerns." },
    { id: "2", text: "Space governance faces new challenges that require updated regulatory frameworks." },
    { id: "3", text: "Space governance focuses mainly on promoting tourism beyond Earth." },
    { id: "4", text: "Space governance discourages commercial activity to preserve scientific research." }
  ],
  correctOption: "2",
  explanation: "Option 2 summarises the transcript’s emphasis on emerging challenges and regulatory needs. Options 1 and 3 contradict the described issues. Option 4 introduces a restriction not mentioned."
},
{
  id: "145",
  title: "The Psychology of Collective Memory",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/145.mp3',
  transcript: "Audio will begin in 10 seconds... Collective memory shapes how societies interpret historical events, often blending documented facts with shared narratives. These memories influence national identity and public discourse. Scholars argue that understanding collective memory is essential for analysing cultural and political behaviour.",
  options: [
    { id: "1", text: "Collective memory is irrelevant to understanding cultural or political behaviour." },
    { id: "2", text: "Collective memory focuses solely on preserving factual historical records." },
    { id: "3", text: "Collective memory discourages societies from forming shared narratives." },
    { id: "4", text: "Collective memory blends facts with narratives and shapes cultural interpretation." }
  ],
  correctOption: "4",
  explanation: "Option 4 summarises the transcript’s focus on narrative, identity, and interpretation. Options 1, 2, and 3 contradict or oversimplify the concept."
},
{
  id: "146",
  title: "The Economics of Universal Basic Income",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/146.mp3',
  transcript: "Audio will begin in 10 seconds... Universal basic income proposes providing citizens with a guaranteed financial allowance to reduce poverty and support economic stability. Critics question its long‑term affordability and potential effects on labour participation. The debate reflects broader concerns about automation and social welfare.",
  options: [
    { id: "1", text: "Universal basic income eliminates the need for all other social programs." },
    { id: "2", text: "Universal basic income is widely accepted as the most efficient welfare model." },
    { id: "3", text: "Universal basic income aims to reduce poverty but raises concerns about cost and labour effects." },
    { id: "4", text: "Universal basic income discourages economic stability by increasing inequality." }
  ],
  correctOption: "3",
  explanation: "Option 3 summarises both the goals and criticisms described. Options 1 and 2 misrepresent the debate. Option 4 contradicts the stated purpose."
},
{
  id: "147",
  title: "The Role of Interdisciplinary Research",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/147.mp3',
  transcript: "Audio will begin in 10 seconds... Interdisciplinary research integrates methods and perspectives from multiple fields to address complex problems that cannot be solved within a single discipline. This approach encourages innovation by challenging traditional academic boundaries. Universities increasingly promote interdisciplinary collaboration to advance scientific and societal progress.",
  options: [
    { id: "1", text: "Interdisciplinary research combines diverse perspectives to address complex problems." },
    { id: "2", text: "Interdisciplinary research limits innovation by reinforcing academic boundaries." },
    { id: "3", text: "Interdisciplinary research is only useful for theoretical studies." },
    { id: "4", text: "Interdisciplinary research discourages collaboration between academic fields." }
  ],
  correctOption: "1",
  explanation: "Option 1 summarises the transcript’s focus on integration and innovation. Options 2, 3, and 4 contradict the described benefits."
},
{
  id: "148",
  title: "The Governance of Artificial General Intelligence",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/148.mp3',
  transcript: "Audio will begin in 10 seconds... Artificial general intelligence raises unprecedented governance challenges because its capabilities could surpass human oversight. Experts argue that international cooperation is essential to establish safety protocols and ethical standards. These discussions highlight the need for proactive regulation before AGI becomes widely deployed.",
  options: [
    { id: "1", text: "AGI governance is unnecessary because its development remains purely theoretical." },
    { id: "2", text: "AGI governance focuses mainly on improving commercial competitiveness." },
    { id: "3", text: "AGI governance discourages innovation by restricting research entirely." },
    { id: "4", text: "AGI governance requires international cooperation to establish safety and ethical standards." }
  ],
  correctOption: "4",
  explanation: "Option 4 summarises the transcript’s emphasis on cooperation and proactive regulation. Options 1, 2, and 3 contradict or oversimplify the governance challenges described."
},
{
  id: "149",
  title: "The Sociology of Digital Communities",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/149.mp3',
  transcript: "Audio will begin in 10 seconds... Digital communities form around shared interests, but their structures often mirror offline social hierarchies. These environments can foster meaningful connection while also amplifying exclusionary behaviour. Sociologists study these dynamics to understand how online interactions shape identity and belonging.",
  options: [
    { id: "1", text: "Digital communities eliminate social hierarchies by treating all members equally." },
    { id: "2", text: "Digital communities focus mainly on entertainment rather than social interaction." },
    { id: "3", text: "Digital communities reflect offline hierarchies and influence identity formation." },
    { id: "4", text: "Digital communities discourage meaningful interaction by limiting communication." }
  ],
  correctOption: "3",
  explanation: "Option 3 summarises the transcript’s focus on hierarchy, identity, and belonging. Options 1, 2, and 4 contradict or oversimplify the described dynamics."
},
{
  id: "150",
  title: "The Philosophy of Scientific Uncertainty",
  question: "Select the correct summary:",
  audioUrl: 'https://storage.googleapis.com/pte_flow_audio/listening/%20highlight_correct_summary/150.mp3',
  transcript: "Audio will begin in 10 seconds... Scientific uncertainty is not a flaw but an inherent feature of inquiry, reflecting the provisional nature of knowledge. Philosophers argue that acknowledging uncertainty encourages more rigorous investigation and prevents premature conclusions. This perspective reframes uncertainty as a driver of intellectual progress.",
  options: [
    { id: "1", text: "Scientific uncertainty undermines research by preventing firm conclusions." },
    { id: "2", text: "Scientific uncertainty is irrelevant because scientific knowledge is always final." },
    { id: "3", text: "Scientific uncertainty reflects the provisional nature of knowledge and drives deeper inquiry." },
    { id: "4", text: "Scientific uncertainty discourages researchers from exploring new ideas." }
  ],
  correctOption: "3",
  explanation: "Option 3 summarises the transcript’s emphasis on uncertainty as a productive force. Options 1, 2, and 4 contradict the philosophical framing described."
}
];