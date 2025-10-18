const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    }));


    const paragraph = document.getElementById('myParagraph');
    const defaultText = paragraph.textContent; // Store the initial text

    paragraph.addEventListener('focus', () => {
      if (paragraph.textContent === defaultText) {
        paragraph.textContent = ''; // Clear text on focus
      }
    });

    paragraph.addEventListener('blur', () => {
      if (paragraph.textContent === '') {
        paragraph.textContent = defaultText; // Restore text if empty on blur
      }
    });


    // Your Hugging Face API token - Replace this with your actual token
    const HF_TOKEN = "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";

    function showLoader() {
      const loader = document.querySelector('.loader');
      const loaderText = document.querySelector('.loader-text');
      const responseBox = document.querySelector('.response');
      loader.style.display = 'block';
      loaderText.style.display = 'block';
      responseBox.classList.add('loading');
      responseBox.textContent = '';
    }

    function hideLoader() {
      const loader = document.querySelector('.loader');
      const loaderText = document.querySelector('.loader-text');
      const responseBox = document.querySelector('.response');
      loader.style.display = 'none';
      loaderText.style.display = 'none';
      responseBox.classList.remove('loading');
    }

    async function query(data) {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    }

    document.querySelector('.submitBtn').addEventListener('click', async function () {
      const name = document.getElementById('name').value.trim();
      const age = document.getElementById('age').value.trim();
      const course = document.getElementById('course').value.trim();
      const aim = document.getElementById('aim').value.trim();
      const responseBox = document.querySelector('.response');

      if (!name || !age || !course || !aim) {
        alert('Please fill in all fields.');
        return;
      }

      showLoader();

      const userPrompt = `my name is ${name}, and i am ${age}years old and currently i am persuing ${course} and my aim is to become ${aim}. give me a perfect career roadmap to achive my goal and reference books and study materials. Answer in only 1400 words.`;
    

      try {
        const response = await query({
          messages: [
            {
              role: "user",
              content: userPrompt
            }
          ],
          model: "deepseek-ai/DeepSeek-V3.2-Exp:novita",
          temperature: 0.7,
          max_tokens: 2000,  // Increased token limit for longer responses
          top_p: 0.95       // Added for better response quality
        });

        hideLoader();

        if (response.choices && response.choices[0] && response.choices[0].message) {
          // Get the raw text and format it
          const rawText = response.choices[0].message.content;
          const formattedText = rawText
            .split('\n')
            .map(line => {
              line = line.trim();
              // Check for bullet points at start of line (only first asterisk)
              if (line.startsWith('*')) {
                return '\n• ' + line.replace(/^\*+\s*/, '');
              }
              // Check for headings at start of line (only first hashtag)
              if (line.startsWith('#')) {
                return '\n' + line.replace(/^#+\s*/, '');
              }
              return line;
            })
            .join(' ')  // Join with spaces instead of newlines
            .replace(/\s{2,}/g, ' ')  // Clean up extra spaces
            .replace(/\n\s*/g, '\n')  // Clean up spaces after newlines
            .trim();                                    // final trim

          responseBox.textContent = ''; // Clear existing content
          let index = 0;
          
          // Enhanced typewriter effect function
          function typeWriter() {
            if (index < formattedText.length) {
              const span = document.createElement('span');
              span.textContent = formattedText[index];
              span.className = 'typewriter-text';
              
              // Add different styling for bullets and improve spacing
              if (formattedText[index] === '•') {
                span.style.color = '#175d69';
                span.style.fontWeight = 'bold';
                span.style.marginLeft = '10px';
              }
              if (formattedText[index] === '\n') {
                responseBox.appendChild(document.createElement('br'));
              }
              
              responseBox.appendChild(span);
              index++;
              
              // Super fast typing with pauses at punctuation
              const speed = formattedText[index - 1] === '.' || formattedText[index - 1] === '\n' ? 20 : 5;
              setTimeout(typeWriter, speed);
            }
          }
          
          typeWriter(); // Start the typewriter effect
        } else {
          throw new Error("Unexpected response format from API");
        }
      } catch (error) {
        hideLoader();
        console.error("Error:", error);
        responseBox.textContent = `Error: ${error.message}. Please make sure you have a valid API token and try again.`;
      }
    });