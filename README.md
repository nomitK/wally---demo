
# 1. Why this doc?
This document outlines all the relevant information about the Wally demo. The approach, methodology, challenges, and costs.

# 2. Challenges/Problem to solve
The demo is solely focus on Wally. Wally is an AI assistant that should trigger a conversatio with the user in order to collect relevant information to update user's health and wellness record.
* Create a web page (both for mobile and web) that interacts with the user
* The web app should awake trigger by voice (it needs to be adapted to MAC, Windows, IOS, and Android)
    * For Mac and Windows we can define a script that runs after a specific word or statement, then we enable voice control on settings, and create a trigger (similar to hello siri) that will open the web page once triggered.
    * For mobile apps, apparenty we could leverage the default assistant (google assistant, siri) but based on research it has some limitations about what it can trigger
        * so the best option for demo purpose is to install an app (tracker) that can be used to trigger events on smartphones
* Once triggered the web app (Wally) will do one of two options:
    * Start recording the conversation immediatly and use the information collected until the first 4 ($threshold) seconds of silence to inform the first question (along side with the current knwoledge about the users - json file: userx_kb.json) - In this scenario the first question takes into consideration (userx_kb.json + recordedconversation_stage0,complete_healhwell_record.json), where complete_healhwell_record is the ideal information that we want to collect
    * Trigger the first question when the web page opens - In this scenario the first question takes into consideration only the userx_kb.json
* Regardless of the option, the demo initiates when Wally does the first question
* The user will res


# 3. Assets
* **Web page / mobile app** - should we think of an idea of creating it a way that can be used via an API and as result be connected with several apps? In this case basically what we need to build is the IP and the tech stack - and then sell it to other apps - it changes the business model, but enable faster time to market and help with the business plan
* **userx_kb.json**: the information Wally know about each user: it will inform the interaction frequency, avatar, questions, ...
* **complete_healhwell_record.json**: The ideal and complete health and wellness record for the user. The gap between userx_kb and complete_healhwell_record will define the cadence of the interaction
* **health_wellness_kb.json**: a certified knwoledge base that will enable notification to promote preventive healthcare and healthier lifestyles
* **the wakening_process**: define the best way to trigger Wally, timely and accurately (North Star Metric: % of non-responses = # times users respond / # time Wally triggers).This should be our IP (perhaps put a patent): a smart way to proactive engage with user

# 3. Problems that are not solved yet
* Record only human voices, ideally from the user, and ignore other sounds (music, noise, ...)
* Enable conversation between 2 or more users with Wally (challenge: permission to collect user information from multiple users)
* Wally to indentify who is talking (is there a way to create an id for each user from the voice) - of so: update the knwoledge base with user_id <-> voice_id mapping, and each user must have a userx_kb.json (that in some case will be empty in the beggining) - we need to this through anonymization to avoid permision issues

# 4. Technical specifications


# 3. COSTS
## 3.1 APIS (Google Cloud Platform)
* Text-to-Speech: 
* LLM: Gemini: 0.961899999/1M tokens

## 3.2 Storage
* Google Cloud


## Server (via Google Clould Platform)
* VM intance:instance-20250217-151156
   * Internal IP: 10.128.0.2
   * External: 34.42.172.165



## 3.3 Other features
* app: tracker


## 4. Pros & Cons





