window.FRENCH_GUIDES={};
window.FRENCH_GUIDES.textTypes = [
  {
    id:'email_formal', name:"Un email formel", en:"Formal email", icon:'✉️', category:'Correspondance', register:'Formal — vous',
    mustInclude:[
      "Email address of the receiver",
      "Email address of the sender",
      "Subject (Objet) — applicable to the task",
      "Date (e.g. jeudi le 9 avril 2026)",
      "Name of the addressee",
      "Introduction line",
      "Body — 3–4 paragraphs, skip a line between each",
      "Closing line",
      "Farewell line",
      "Name / signature",
      "Express opinions and emotions where relevant",
    ],
    phrases:{
      opening:["Cher monsieur — Dear Sir","Chère madame — Dear Madam","Chère Mademoiselle — Dear Miss","Chers amis — Dear friends","Monsieur le directeur / la directrice — Dear Principal"],
      closing:["Dans l'attente de vous lire — Looking forward to your reply","Merci beaucoup pour votre attention — Thank you for your attention","J'attends votre réponse avec grande impatience — I eagerly await your response"],
      farewell:["Cordialement — Kind regards","Respectueusement — Respectfully","Bien à vous — Yours / Kind regards","Veuillez agréer, Madame, mes sincères salutations","Veuillez recevoir, Monsieur/Madame, mes salutations distinguées","Je vous prie d'agréer, Monsieur le Directeur, l'assurance de ma profonde considération","Meilleures salutations — Best regards"],
    },
    sample:`À : madame.directrice@lycee.fr
De : leon.webber@students.hale.wa.edu.au
Mardi le huit février 2026
Objet : Critique du film — Il a déjà tes yeux

Chère Madame la Directrice,

J'ai vu récemment un film incroyable avec l'actrice Aïssa Maïga en tête d'affiche et je voudrais partager mes impressions avec vous.

[Body — 3 to 4 paragraphs, skip a line between each.]

Dans l'attente de vous lire,
Cordialement,
Léon Webber`,
    tips:`Use vous throughout. No contractions or slang. Avoid emojis. Use connectives (premièrement, ensuite, en revanche, par conséquent). Sign with full name.`,
  },
  {
    id:'email_informal', name:"Un email informel", en:"Informal email", icon:'📧', category:'Correspondance', register:'Informal — tu',
    mustInclude:[
      "Brief subject if relevant",
      "Date",
      "Casual opening (Salut Léon, Coucou ma chérie…)",
      "Introduction question",
      "Body — 2–3 short paragraphs",
      "Sign-off",
      "Signature (first name only)",
    ],
    phrases:{
      opening:["Mon cher Moussa — My dear Moussa","Ma chère Florence — My dear Florence","Salut [Nom] !","Coucou !","Hey [Nom] !"],
      closing:["À bientôt — See you soon","Ton ami(e) dévoué(e) — Your devoted friend","Hâte de te lire !","Donne-moi de tes nouvelles"],
      farewell:["Bisous (= kisses) — for family / close friends","Bises — kisses","Je t'embrasse (bien fort) — Big hug","Grosses bises / Gros bisous","Bisous de Marseille","Amicalement — Kindly","Chaleureusement — Warm regards","À bientôt / À plus tard","Tchao !","Tendresse — fondly","Avec des pensées affectueuses","Bien à toi","A+","Aurevoir — Bye"],
    },
    sample:`Salut Antoine !

Comment ça va ? Ça fait un bail qu'on ne s'est pas parlé !

[Body — 2–3 short paragraphs about your news.]

À très bientôt !
Bises,
Léon`,
    tips:`Use tu, contractions (j'ai, t'as), exclamations. You can use emoji sparingly. Keep paragraphs short.`,
  },
  {
    id:'blog', name:"Un blog", en:"Blog post", icon:'💻', category:'Web & médias', register:'Mostly informal, but use vous (group audience)',
    mustInclude:[
      "Site address (e.g. www.discutonsdufutur.fr)",
      "Title of the entry",
      "Date of the post",
      "Greeting of the readers (Salut les copains bloggeurs / Bonjour et bienvenue sur le blog…)",
      "Body — 3–4 paragraphs, skip a line after each",
      "Conclusion line + farewell",
      "Comments invitation",
      "Author name",
    ],
    phrases:{
      opening:["Salut les amis bloggeurs ! (informal)","Bonjour et bienvenue sur le blog des amoureux du numérique (formal)","Salut les copains bloggeurs !","Sans l'ombre d'un doute, …"],
      closing:["On se retrouve bientôt pour un nouvel article — See you soon for a new article","À la semaine prochaine pour un nouveau post","Je vous donne rendez-vous la semaine prochaine où je vous parlerai de…","N'hésitez pas à me contacter — Do not hesitate to contact me","Laissez vos commentaires — Leave your comments","J'attends vos réactions — I'm waiting for your feedback"],
      farewell:["À bientôt les bloggeurs","Rendez-vous la semaine prochaine sur mon blog de…"],
    },
    sample:`http://blog: www.discutonsdufutur.fr
Date : vendredi le neuf mars 2026
Titre : Le rôle des nouvelles technologies dans ma vie

Bonjour les amis,

Sans l'ombre d'un doute, la technologie joue un grand rôle dans ma vie !

[Body — multiple paragraphs about your technology use, personal anecdotes, opinions.]

Voilà, c'est ma vie et je l'adore telle qu'elle !

J'attends vos commentaires
Michelle`,
    tips:`First-person, opinionated voice. Use vous (group). Open with a hook, close with a CTA inviting comments. Include date archives strip at the bottom if natural.`,
    extra:{
      responding:`When responding to a blog post: 1) acknowledge you read it, 2) reference specific content, 3) give an opinion.

Useful openings:
• J'ai beaucoup aimé lire ton/votre blog ! — I really enjoyed reading your blog
• Merci pour ton/votre article !
• Merci d'avoir partagé ton/votre aventure, c'était super intéressant !
• Dans ton blog tu dis / vous dites que… — In your blog you say that…
• Je suis d'accord avec toi/vous quand tu dis / vous dites que…
• Je ne suis pas d'accord avec toi/vous quand tu dis / vous dites que…`,
    },
  },
  {
    id:'film_review', name:"Une critique de film", en:"Film review", icon:'🎬', category:'Cinéma', register:'Formal — neutral / engaged',
    mustInclude:[
      "A catchy title / header",
      "A date",
      "An introduction line",
      "Synopsis — main plot points, main characters, genre / style",
      "Description — your impression",
      "When possible, an info box at the end: title, director, producer, rating",
      "Formal language",
      "Conclusion — your evaluation / recommendation",
      "Tone must engage the reader",
    ],
    phrases:{
      opening:["Il y a quelques semaines, j'ai regardé un film qui s'appelle…","Récemment j'ai eu la chance de voir…","Je viens de visionner…"],
      body:["C'est un film engagé de 1995 en noir et blanc qui a pour objectif de…","L'histoire se déroule à…","Le réalisateur est…","Les personnages principaux sont…","J'ai beaucoup apprécié ce film pour de nombreuses raisons : l'intrigue est très complexe, la musique est vraiment ingénieuse…"],
      closing:["En conclusion, je recommande fortement ce film","Si j'avais à lui donner une note je lui donnerais neuf sur dix","Un film à voir absolument","Je ne peux que vous le conseiller"],
    },
    sample:`Critique du film : La Haine
Date. Perth le 30 mars 2026

Introduction :
Il y a quelques semaines, j'ai regardé un film qui s'appelle La Haine. C'est un film d'action, mais aussi dramatique.

Body (3–4 paragraphs):
C'est un film engagé de 1995 en noir et blanc qui a pour objectif de montrer la brutalité policière. Les personnages principaux sont Vince, Hubert et Said, joués par Vincent Cassel, Hubert Koundé et Said Taghmaoui. Le réalisateur est Mathieu Kassovitz.

L'histoire se déroule à Paris et met en scène trois jeunes en colère contre la police après que leur ami Abdel ait été tué en garde à vue…

J'ai beaucoup apprécié ce film pour de nombreuses raisons : l'intrigue est très complexe, la musique est vraiment ingénieuse, il y a beaucoup de suspense et les vedettes sont d'excellents acteurs.

Conclusion :
En conclusion, je recommande fortement ce film et si j'avais à lui donner une note je lui donnerais neuf sur dix.`,
    tips:`Use cinema vocab: le réalisateur, le scénario, l'intrigue, le tournage, la bande originale, la mise en scène, les vedettes, le dénouement. End with a clear recommendation and an optional rating.`,
  },
  {
    id:'diary', name:"Le journal intime", en:"Diary entry", icon:'📖', category:'Personnel', register:'Informal — first person, expressive',
    mustInclude:[
      "Date, place & time (Perth, mardi le neuf avril 2026, 20h)",
      "Opening line (Cher journal, Salut mon journal, Salut mon vieux !, Bonjour mon journal)",
      "Introduction line (Je crois que je suis stressé(e) !)",
      "Body — 3–4 paragraphs, skip a line between each",
      "Informal register — direct, expressive",
      "Closing line (Ça m'a fait du bien de pouvoir te parler, à demain, je tombe de sommeil !)",
      "Farewell line (Bonne nuit !, à demain, à la prochaine, à plus)",
      "Name / signature",
      "First-person narration; familiar expressions (j'en peux plus !)",
      "Express feelings",
      "Logical structure: Tout d'abord, ensuite, finalement",
    ],
    phrases:{
      opening:["Cher journal,","Salut mon journal,","Salut mon vieux !","Bonjour mon journal,"],
      closing:["Bon je vais essayer de dormir maintenant, on se reparle demain","Ça m'a fait du bien de pouvoir te parler","Je crois que c'est tout pour ce soir","Je tombe de sommeil !","À demain"],
      farewell:["Bonne nuit !","À demain","À la prochaine","À plus","Tendrement"],
    },
    sample:`Date : Perth, dimanche 12 mai 2026

Cher journal,

J'en peux plus, c'est trop dur !

Tout d'abord, figure-toi qu'avec l'approche des examens je suis vraiment très stressé. Je ne dors plus, je ne mange plus et j'ai perdu goût à tout !

Alors, j'essaie de décompresser en regardant la télévision, en écoutant de la musique en faisant du sport, mais rien à faire ! Le stress ne me lâche pas !

En conséquent, je crois que j'ai pris huit kilos depuis le début de l'année, je mange tout le temps. La nourriture m'aide à me détendre, mais ça ne dure pas longtemps alors je mange dès que je me sens à nouveau stressé, c'est la cata…

Bon je vais essayer de dormir maintenant, on se reparle demain.

Bonne nuit,
Solange`,
    tips:`First-person, very personal. Use familiar expressions: j'en peux plus, c'est la cata, figure-toi que, ça me saoule. Connect with tout d'abord / ensuite / finalement / en conséquence. Express clear emotions.`,
  },
  {
    id:'letter_formal', name:"Une lettre formelle", en:"Formal letter", icon:'📜', category:'Correspondance', register:'Formal — vous',
    mustInclude:[
      "Address of the receiver",
      "Date & place (Sydney le 15 janvier 2026)",
      "Opening line (Chère Madame, Monsieur, Madame Fontaine,)",
      "Introduction line",
      "Body — 3–4 paragraphs, skip a line between each",
      "Closing line",
      "Farewell line",
      "Name / signature",
      "Logical structure with clear connectives",
    ],
    phrases:{
      opening:["Madame, Monsieur,","Chère Madame [Nom],","Cher Monsieur [Nom],","Monsieur le Directeur,"],
      body:["Je vous écris pour…","L'objet de cette lettre est de…","Je tenais à vous faire part de…","Premièrement, …","Ensuite, …","Personnellement, …","Finalement, …"],
      closing:["Voilà, je tenais à vous féliciter pour cet article…","En espérant une réponse de votre part,","Dans l'attente de votre réponse,"],
      farewell:["Veuillez agréer, Madame, l'expression de mes sentiments distingués","Veuillez recevoir, Madame Fontaine, l'expression de mes salutations distinguées","Je vous prie de croire, Monsieur, en l'assurance de ma considération distinguée","Cordialement,","Respectueusement,"],
    },
    sample:`Magazine vision du monde
8 rue de la jardinière
13009, Marseille

Perth, le 20 mai 2026

Chère Madame Fontaine,

Je m'appelle Violette et l'objet de cette lettre est de partager mon opinion sur un article très intéressant que j'ai lu récemment dans votre journal.

L'article auquel je fais référence s'appelle 'Courrier des lecteurs' et je voulais vous faire savoir que je suis tout à fait d'accord avec vos commentaires.

Premièrement, dans votre article vous disiez que les films australiens proposent généralement plus d'action et d'effets spéciaux. Ensuite, vous faisiez référence qu'à l'inverse, les films francophones sont beaucoup plus sentimentaux. Personnellement, je préfère les films français…

Voilà, finalement, je tenais à vous féliciter pour cet article que je trouve si bien écrit.

Veuillez recevoir, Madame Fontaine, l'expression de mes salutations distinguées,

Violette Chapeau`,
    tips:`No contractions. Use vous and formal connectives. Opening salutation = chère/cher; farewell uses one of the long polite formulas. The body should clearly state purpose in the first paragraph.`,
  },
  {
    id:'letter_informal', name:"Une lettre informelle", en:"Informal letter", icon:'💌', category:'Correspondance', register:'Informal — tu',
    mustInclude:[
      "Address of the receiver",
      "Date & place (Perth, le 02 septembre 2026)",
      "Opening line (Cher Martial, cher papa, chère maman, salut Vincent,)",
      "Introduction line (Comment ça va ?)",
      "Body — 3–4 paragraphs, skip a line between each",
      "Closing line",
      "Farewell line (Bisous, tendrement)",
      "Name / signature",
      "Use of connectives",
    ],
    phrases:{
      opening:["Salut Celene,","Cher Martial,","Chère maman,","Coucou ma puce,"],
      body:["Comment ça va ? Ça fait un bail qu'on ne s'est pas parlé.","Devine ce qui m'est arrivé…","Tu ne devineras jamais ce que…","Tout d'abord, …","En conséquence, …","D'après toi, qu'est-ce que je dois faire ?"],
      closing:["J'attends de tes nouvelles avec grande impatience","Écris-moi bientôt","À très bientôt","Donne-moi de tes nouvelles"],
      farewell:["Bisous","Tendrement","Bises","Tchao !","Je t'embrasse","Grosses bises"],
    },
    sample:`Martial Lepetit
12 avenue de Mazargues
75010, Paris

Perth, le 02 septembre 2026

Salut Celene,

Comment ça va ? Ça fait un bail qu'on ne s'est pas parlé.

Dans quelques jours j'aurai enfin terminé mes examens et j'envisage de m'installer à Paris pour mes études.

Comme je l'avais mentionné dans ma précédente lettre, mon rêve depuis toujours est d'étudier le ballet à l'Opéra national de Paris. Tu ne devineras jamais ce qui vient de m'arriver !

J'attends tes conseils avec grande impatience.

Tchao !
Timothée`,
    tips:`Use tu, contractions, exclamations. Open with comment ça va. Close warmly. Connectives are casual: alors, du coup, en plus, en fait.`,
  },
  {
    id:'article', name:"Un article", en:"Newspaper / magazine article", icon:'📰', category:'Web & médias', register:'Neutral to formal — depends on publication',
    mustInclude:[
      "Title (gros titre)",
      "Date and the name of the newspaper",
      "Introduction",
      "Body — multiple paragraphs or columns, with subheadings (sous-titres)",
      "Conclusion",
      "Catchy closing line",
      "Name of the author",
    ],
    phrases:{
      opening:["Sommes-nous drogués aux technologies ?","Un constat alarmant : …","Aujourd'hui plus que jamais, …"],
      body:["Selon une enquête menée par…","En termes de pourcentage, l'article révèle que 48 % des jeunes…","Force est de constater que…","Cependant, il convient de souligner que…"],
      closing:["Alors, soyons vigilants et aidons-nous les uns les autres.","Le débat reste ouvert.","À nous de prendre nos responsabilités."],
    },
    sample:`Titre : Les jeunes et la dépendance aux technologies.
La petite Gazette le 13 avril 2026.

Un tiers de notre journée en ligne.

Sommes-nous drogués aux technologies ? Entre nos ordis, nos portables, les réseaux sociaux, TikTok et les jeux vidéo, il semblerait que nous devenions de plus en plus accros au numérique !

Impact sur la communication
Selon une enquête menée par le journal de sociologie 'Sociologie de l'Éducation', l'omniprésence du numérique dans notre quotidien nous rendrait de moins en moins sociables. 48 % des jeunes souffriraient de dépendance au numérique.

L'impact éducatif
Passer trop de temps en ligne nous amène aussi à négliger notre travail scolaire et nos activités extracurriculaires…

Prévention
Alors, soyons vigilants et aidons-nous les uns les autres.

Par Dorian Depardieu`,
    tips:`Use percentages and statistics to reinforce arguments. Subheadings break up paragraphs. Tone can be neutral OR opinionated — pick one and stick with it.`,
  },
  {
    id:'speech', name:"Un discours", en:"Speech", icon:'🎤', category:'Oral', register:'Formal — engage the audience',
    mustInclude:[
      "Greeting (formal or informal)",
      "Introduction of yourself",
      "Body — 3–4 paragraphs, skip a line after each",
      "Concluding statement",
      "Thanks at the end",
    ],
    phrases:{
      opening:["Bonjour les amis","Salut la classe","Bonjour à tous","Mesdames et messieurs","Cher/chère directeur/directrice et camarades","Chers camarades — Dear friends","Chers amis — Dear friends","Bonjour tout le monde","Bonjour Mesdames et messieurs","Bonjour les membres du jury","Bonjour chers invités","Chers collègues — Fellow colleagues"],
      body:["Je m'appelle Léo et je voudrais vous parler aujourd'hui…","Je m'appelle Ambre et je suis venu vous parler aujourd'hui…","Aujourd'hui j'aimerais aborder le problème de…"],
      closing:["En conclusion je voudrais dire…","Pour finir je voudrais dire…","Voilà, j'espère que je vous ai convaincus."],
      farewell:["Merci beaucoup pour votre attention","Merci d'être venus aujourd'hui","Merci pour votre temps","J'apprécie énormément votre attention aujourd'hui","Merci pour votre attention"],
    },
    sample:`Chers camarades et chers professeurs !

Je m'appelle Louna et je suis en classe de première et aujourd'hui j'aimerais vous parler du problème du cyber-harcèlement dans notre école.

Malheureusement, c'est un problème qui existe dans toutes les écoles, y compris la nôtre. Cependant, je crois que la situation peut être gérée…

Il me semble que si un élève est signalé pour cyber-harcèlement, il devrait alors s'exposer à des conséquences graves…

Pour ce qui est des forums, je propose que nous ayons des ateliers chaque mois…

Voilà, j'espère que je vous ai convaincus et si ce combat vous intéresse, venez nous rejoindre vendredi prochain à la salle 26 pour plus d'information.

À vendredi je l'espère, merci pour votre attention !`,
    tips:`Use rhetorical questions, anaphora (repeating "il faut…"), inclusive nous, and a clear call to action. End with thanks.`,
  },
  {
    id:'account', name:"Un compte rendu / résumé", en:"Account / chronological report", icon:'📜', category:'Récit', register:'Formal — mostly past tense',
    mustInclude:[
      "Title (L'origine de l'immigration en France) — first person also possible (Le jour où j'ai immigré en France)",
      "Name of the writer (Par Daniel Henry)",
      "Introduction",
      "Body — frame chronologically",
      "Time words: au fil du temps, la première vague, la dernière vague",
      "Time connectives: ensuite, puis, après, d'abord",
      "Tense: mostly past tense",
      "Conclusion",
    ],
    phrases:{
      body:["D'abord, …","Ensuite, …","Puis, …","Après, …","Au fil du temps, …","Plus tard, …","Finalement, …","La première vague…","La dernière vague…"],
      closing:["En conclusion, …","Au final, …","Pour résumer, …"],
    },
    sample:`L'immigration en France
Par Lamine Henry

Introduction.
La France a toujours été un pays d'accueil et l'immigration est enracinée dans l'histoire de la France. Elle a connu de grandes vagues d'immigration au fil du temps.

La première vague d'immigration commence en 1850 et continue jusqu'au début de la Première Guerre mondiale. Les immigrants sont essentiellement Belges, Italiens, Suisses et Espagnols…

Une autre vague très importante a lieu pendant l'entre-deux-guerres. Cette fois-ci l'immigration est d'origine maghrébine…

La dernière vague importante d'immigration se situe dans les années 70 avec un flux migratoire en provenance d'Afrique subsaharienne…

En conclusion, l'ensemble des immigrés en France représente 8 % de la population française. Leur arrivée découle essentiellement de l'histoire coloniale et du besoin de reconstruction de la France.`,
    tips:`Factual reporting. Precise dates and time frames. Past tenses dominate (passé composé / imparfait). Logical chronological structure.`,
  },
  {
    id:'interview', name:"Une interview", en:"Interview", icon:'🎙️', category:'Oral / journalistic', register:'Journalistic — mixed direct speech',
    mustInclude:[
      "Title (Un interview avec Soprano : Chanter c'est s'engager)",
      "Name of the writer (Florian Hassan)",
      "Date (if from a newspaper or magazine)",
      "Introduction — opening salutations",
      "Body — conversation between interviewer and interviewee (Q&A)",
      "Direct quotations where possible",
      "Mixed direct speech and contextual info",
      "Journalistic style",
      "Conclusion",
    ],
    phrases:{
      body:["Bonjour [Nom] et merci d'être venu nous rencontrer aujourd'hui.","La première question que j'ai envie de vous poser est…","Vous croyez que…","Vous avez dit récemment que…","C'est important de…","Pour vous, …","Que pensez-vous de…"],
      closing:["Merci encore mille fois [Nom] et bonne chance pour…","Merci à vous","Au revoir et bonne continuation"],
    },
    sample:`Chanter, c'est s'engager.
Par Florian Hassan

À l'approche de son nouvel album 'Chasseur d'Étoiles', Soprano nous a très gentiment accordé un interview pour nous parler de l'inspiration derrière le texte de Racine.

— Bonjour Soprano et merci d'être venu nous rencontrer aujourd'hui. La première question que j'ai envie de vous poser est : comment vous est venu l'inspiration d'écrire 'Racine' ?

— Bonjour Florian, merci de m'accueillir. 'Racine' c'est avant tout un cri du cœur suite aux récents évènements aux États-Unis.

— Quel message voulez-vous faire passer à travers cette chanson ?

— Je pense que le message est clair : c'est un appel à la vigilance car nous sommes en 2026 et le racisme est toujours un fait d'actualité…

— Merci encore mille fois Soprano et bonne chance pour la sortie de votre album !
— Merci à vous Florian.`,
    tips:`Mix open-ended questions with follow-ups. Use direct speech with dashes. Include at least one direct quotation from the interviewee. Add brief contextual info between answers.`,
  },
  {
    id:'report', name:"Un rapport", en:"Report", icon:'📊', category:'Rapport', register:'Formal — descriptive, factual',
    mustInclude:[
      "Title (L'immigration francophone)",
      "Date",
      "Classification / opening statement",
      "Description — series of facts",
      "Conclusion — general statement",
      "Tense: mostly present",
      "Descriptive and factual language",
      "Logical sequence: Premièrement, deuxièmement, troisièmement",
      "Technical terms",
      "Figures, percentages, numbers",
    ],
    phrases:{
      body:["Premièrement, …","Deuxièmement, …","Troisièmement, …","Il y a un lien direct entre…","Selon les statistiques, …","En moyenne, …","X % des … sont …"],
      closing:["En conclusion, …","Pour résumer, ces trois problèmes…","Les données démontrent que…"],
    },
    sample:`Titre : Les problèmes que rencontrent le plus les jeunes en classe de terminale en 2026
Date : 16 janvier 2026

Trois problèmes majeurs affectent les jeunes en classe de terminale en 2026 :
• Le stress
• L'abus d'alcool
• La dépendance à des substances

Premièrement, les étudiants en année du baccalauréat sont en moyenne six fois plus stressés que les autres élèves. Il y a donc un lien direct entre être en année du baccalauréat et l'augmentation du stress.

Deuxièmement, 3 jeunes sur 5 en année du baccalauréat consomment de l'alcool en grosse quantité…

Troisièmement, la moitié des étudiants en année du baccalauréat prennent plus régulièrement de drogues…

Conclusion :
Le stress, l'abus d'alcool et de drogues sont les trois problèmes prédominants auxquels les jeunes en classe de terminale font face en 2026.`,
    tips:`Present tense, factual, neutral tone. Always back claims with figures or percentages. Use bullet points if helpful.`,
  },
  {
    id:'note', name:"Une note", en:"Note", icon:'📝', category:'Brief', register:'Informal or formal (business note)',
    mustInclude:[
      "Salutations",
      "Opening line",
      "Date",
      "Body — brief and to the point, few details",
      "Signature",
      "Style: informal (personal record) or formal (business note)",
    ],
    phrases:{ opening:["Salut [Nom],","Bonjour,","Note rapide :"], closing:["Merci !","À tout à l'heure","Cordialement"], },
    sample:`Salut Léon,
Note rapide : la réunion est repoussée à 14h00 demain au lieu de 10h.
Merci !
A.`,
    tips:`Keep it under 60 words. One main message only. Optional date / signature.`,
  },
  {
    id:'advertisement', name:"Une publicité", en:"Advertisement", icon:'📣', category:'Persuasif', register:'Persuasive — superlatives & imperatives',
    mustInclude:[
      "Title",
      "Opening line",
      "Date",
      "Body — brief, persuasive, few details",
      "Signature / brand",
      "Style: persuasive",
      "Use facts and statistics",
      "Info presented in a logical manner",
    ],
    phrases:{ opening:["Découvrez…","Vous cherchez…","Imaginez un monde où…"], body:["Avec X%, vous économisez…","Un produit unique, conçu pour…","100 % naturel, 0 % compromis"], closing:["Profitez-en dès maintenant !","Commandez aujourd'hui !","Ne manquez pas cette occasion !"] },
    sample:`NOUVEAU : SmartLearn — l'app qui révolutionne ton apprentissage !

Tu en as marre de réviser à l'aveugle ? SmartLearn personnalise ton étude grâce à l'intelligence artificielle.

• Plus de 95 % de réussite chez nos utilisateurs.
• Cartes de révision intelligentes.
• 14 jours d'essai gratuit.

Télécharge maintenant — SmartLearn.fr`,
    tips:`Use impératif (Découvrez, Commandez), superlatifs (le meilleur, le plus rapide), and percentages. Strong call-to-action at the end.`,
  },
  {
    id:'announcement', name:"Une annonce", en:"Announcement", icon:'📢', category:'Persuasif', register:'Formal or semi-formal — informative',
    mustInclude:["Date & time","Title","Location","Body","Contact person"],
    phrases:{ opening:["Avis aux étudiants :","Annonce importante :","Tous les membres sont priés…"], closing:["Pour plus d'informations, contactez…","Présence obligatoire."] },
    sample:`Avis aux étudiants !
Date : vendredi le 7 juin 2026 — 14h
Lieu : Salle 26

Atelier sur le cyber-harcèlement : venez nombreux échanger sur ce sujet d'actualité.

Pour plus d'informations, contactez Madame Dubois : sophie.dubois@hale.wa.edu.au`,
    tips:`Be precise about who/what/where/when. Include a contact at the end.`,
  },
  {
    id:'cartoon', name:"Une bande dessinée", en:"Cartoon / comic strip", icon:'💭', category:'Visuel', register:'Critical, satirical or humorous',
    mustInclude:[
      "Panels — sequence of drawings that tell a story",
      "Splash — a panel that spans the page width (often used for the title)",
      "Speech bubbles",
      "Voice-over — narrator text to the reader",
      "Tone: critical, satirical, or humorous",
    ],
    phrases:{},
    sample:`(Splash panel — Title bar)
TITRE : "LE SMARTPHONE, MON MEILLEUR ENNEMI"

Panel 1 — Voice-over: "Chaque matin, c'est le même rituel…"
Speech bubble (boy): "Encore 5 minutes !"

Panel 2 — Voice-over: "Mais dès que mon portable vibre…"
Speech bubble (boy): "Oh ! Un message !"

Panel 3 — Voice-over: "Une heure plus tard… je suis toujours au lit."
Speech bubble (mère, off-panel): "TU ES EN RETARD !!!"

Panel 4 — Splash — Voice-over: "Et tout est de SA faute."`,
    tips:`Describe panels in writing. Use ALL CAPS for shouted dialogue. Splash panel = full-width panel. Mention voice-over vs speech bubbles.`,
  },
  {
    id:'chart', name:"Un graphique", en:"Chart / graph", icon:'📈', category:'Visuel', register:'Formal — descriptive',
    mustInclude:["Title","Legend","Speech bubbles / labels","Description of your data"],
    phrases:{ body:["Selon ce graphique, …","Les données démontrent que…","On observe une augmentation / baisse de…","La majorité des … indique que…","En revanche, …"] },
    sample:`Titre : Temps passé en ligne par les jeunes en 2026
Légende : Moins de 2h / 2-4h / 4-6h / Plus de 6h

Description : Selon ce graphique, plus de 40 % des jeunes Australiens passent plus de 6 heures en ligne par jour. Ce chiffre a augmenté de 15 % depuis 2022.`,
    tips:`Always interpret the data — don't just describe it. Use precise figures and trend language (augmentation, baisse, tendance).`,
  },
  {
    id:'film_tv_excerpt', name:"Un extrait de film / programme télé", en:"Film or TV excerpt", icon:'🎞️', category:'Visuel', register:'Mostly formal',
    mustInclude:["Title","Introduction","Body — short extract / specific example","Signature"],
    phrases:{},
    sample:`Titre : Extrait de "Intouchables"
Introduction : Ce passage met en scène la première rencontre entre Driss et Philippe…

Body — extrait :
Philippe : "Vous savez pourquoi je vous embauche ?"
Driss : "Parce que je suis le seul à ne pas vous regarder comme un handicapé."

Cette scène est cruciale car elle montre…

Signature : Léon Webber`,
    tips:`Pick ONE specific scene. Include real dialogue. Comment briefly on its meaning or significance.`,
  },
  {
    id:'form', name:"Un formulaire", en:"Form", icon:'📋', category:'Brief', register:'Formal — mostly present tense',
    mustInclude:[
      "Title — objet of the form",
      "Date",
      "Contact details of the person",
      "Body — multiple questions, sections / categories, sub-sections",
      "Register: formal",
      "Logical sequence of facts",
      "Tense: mainly present",
    ],
    phrases:{},
    sample:`FORMULAIRE D'INSCRIPTION — ATELIER FRANÇAIS 2026
Date : 5 juin 2026

Coordonnées :
Nom : ___________________
Prénom : ___________________
Date de naissance : __/__/____
Téléphone : ___________________
Email : ___________________

Section A — Niveau
☐ Débutant   ☐ Intermédiaire   ☐ Avancé

Section B — Disponibilité
☐ Lundi matin   ☐ Mardi soir   ☐ Samedi après-midi

Section C — Motivation (3 lignes max)
___________________________________________

Signature : ___________________`,
    tips:`Use clear section labels. Checkboxes (☐) for option lists. Keep questions short and unambiguous.`,
  },
  {
    id:'message', name:"Un message", en:"Message", icon:'💬', category:'Brief', register:'Depends on recipient — written or spoken',
    mustInclude:[
      "Salutations",
      "Opening line",
      "Date — optional (if written form)",
      "Body — specific info depending on message type",
      "Closing line",
      "Signature",
      "Style: depends on recipient and on written vs spoken form",
    ],
    phrases:{ opening:["Salut [Nom],","Bonjour,","Hey !"], closing:["À toute","À plus","Cordialement"], },
    sample:`Salut Léon,

Petit message pour te dire que je ne pourrai pas être au rendez-vous demain — je suis cloué au lit avec une grippe. On peut reporter à samedi ?

À très vite,
Antoine`,
    tips:`Short, one main point, clear call to action or reply expected. Choose register based on recipient.`,
  },
];
