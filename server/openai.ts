// Custom content generator for blog posts
export interface GeneratedBlogContent {
  content: string;
  excerpt: string;
}

// Sample entrepreneurship topics and content templates
const entrepreneurshipTopics = [
  {
    keywords: ["innovation", "startup", "disrupt"],
    content: `Innovation is the cornerstone of successful entrepreneurship. In today's rapidly evolving business landscape, entrepreneurs must continuously seek new ways to create value and solve problems. This involves understanding market gaps, leveraging technology, and building scalable solutions that can adapt to changing consumer needs.

The startup ecosystem has evolved significantly over the past decade. Entrepreneurs now have access to more resources, funding opportunities, and support networks than ever before. However, this also means increased competition and the need for more sophisticated business strategies.

Key principles for successful innovation include:
• Customer-centric approach: Always start with understanding your target audience
• Rapid prototyping: Test ideas quickly and iterate based on feedback
• Scalability: Build solutions that can grow with your business
• Sustainability: Consider long-term impact and environmental responsibility

Modern entrepreneurs must also navigate digital transformation, which has changed how businesses operate, market themselves, and serve customers. This includes understanding e-commerce, social media marketing, data analytics, and digital customer experience.

The future of entrepreneurship lies in combining traditional business acumen with technological innovation, creating solutions that are both profitable and socially responsible.`
  },
  {
    keywords: ["leadership", "team", "management"],
    content: `Effective leadership is crucial for entrepreneurial success. Building and managing a team requires a unique set of skills that go beyond technical expertise. Entrepreneurs must inspire, motivate, and guide their teams while making strategic decisions under uncertainty.

Leadership in entrepreneurship involves several key components:
• Vision communication: Clearly articulating the company's mission and goals
• Team building: Recruiting the right people and fostering collaboration
• Decision making: Making informed choices with limited information
• Adaptability: Adjusting strategies based on market feedback and changes

The entrepreneurial journey is filled with challenges that test leadership abilities. From securing funding to scaling operations, leaders must maintain resilience and inspire confidence in their teams and stakeholders.

Modern leadership also requires understanding diverse perspectives, promoting inclusion, and creating environments where innovation can flourish. This includes recognizing different working styles, cultural backgrounds, and professional experiences.

Communication skills are particularly important for entrepreneurial leaders. They must be able to pitch ideas to investors, negotiate with partners, and motivate employees. This requires both verbal and written communication abilities, as well as active listening skills.

Building a strong organizational culture from the early stages of a business is essential for long-term success. This involves establishing values, processes, and systems that support growth and innovation.`
  },
  {
    keywords: ["market", "customer", "research"],
    content: `Market research is fundamental to entrepreneurial success. Understanding your target market, customer needs, and competitive landscape provides the foundation for making informed business decisions and developing effective strategies.

Comprehensive market research involves multiple approaches:
• Primary research: Direct interaction with potential customers through surveys, interviews, and focus groups
• Secondary research: Analysis of existing data, industry reports, and market trends
• Competitive analysis: Understanding what competitors offer and identifying market gaps
• Customer personas: Creating detailed profiles of ideal customers

The digital age has transformed how entrepreneurs conduct market research. Online tools, social media analytics, and e-commerce platforms provide unprecedented access to customer data and behavior patterns. This information can be used to refine products, improve marketing strategies, and identify new opportunities.

Understanding market dynamics is equally important. This includes recognizing seasonal trends, economic factors, and technological changes that might impact your business. Successful entrepreneurs continuously monitor these factors and adjust their strategies accordingly.

Customer validation is a critical component of market research. Before investing significant resources in product development, entrepreneurs should test their assumptions with real customers. This iterative process helps ensure that the final product meets market needs and has commercial viability.

Modern market research also emphasizes the importance of data privacy and ethical considerations. Entrepreneurs must balance the need for customer insights with respect for privacy and compliance with regulations.`
  }
];

export async function generateBlogContent(
  headline: string, 
  imageBase64?: string
): Promise<GeneratedBlogContent> {
  try {
    // Find relevant topic based on headline keywords
    const headlineLower = headline.toLowerCase();
    let selectedTopic = entrepreneurshipTopics[0]; // default
    
    for (const topic of entrepreneurshipTopics) {
      if (topic.keywords.some(keyword => headlineLower.includes(keyword))) {
        selectedTopic = topic;
        break;
      }
    }

    // Generate contextual content based on headline
    const content = `# ${headline}

${selectedTopic.content}

## Practical Applications

Understanding these concepts is essential for aspiring entrepreneurs. The Centre of Entrepreneurship provides resources and support to help individuals navigate the complex world of business creation and innovation.

## Key Takeaways

• Research and planning are fundamental to success
• Building strong relationships with customers and stakeholders is crucial
• Continuous learning and adaptation are necessary in today's business environment
• Sustainable practices contribute to long-term success
• Technology can be leveraged to create competitive advantages

## Conclusion

The entrepreneurial journey requires dedication, strategic thinking, and continuous learning. By applying these principles and staying informed about industry trends, entrepreneurs can build successful, sustainable businesses that create value for customers and society.

Remember that entrepreneurship is not just about starting a business—it's about creating solutions that make a positive impact on the world while building sustainable economic value.`;

    // Generate excerpt from the content
    const excerpt = `Explore essential insights about ${headline.toLowerCase()} and discover key strategies for entrepreneurial success in today's business landscape.`;

    return {
      content: content,
      excerpt: excerpt.substring(0, 200)
    };
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error("Failed to generate blog content: " + (error as Error).message);
  }
}

export async function analyzeImage(base64Image: string): Promise<string> {
  try {
    // Custom image analysis for entrepreneurship content
    const analysisTemplates = [
      "This image appears to show business professionals or entrepreneurs in a collaborative setting. It suggests themes of teamwork, innovation, and strategic planning that are relevant to entrepreneurship education.",
      "The image depicts elements related to business growth, market analysis, or startup culture. These visual cues can inspire content about scaling businesses, market research, or entrepreneurial mindset.",
      "This visual content relates to business innovation, technology adoption, or entrepreneurial success stories. It provides context for discussing modern business practices and digital transformation.",
      "The image shows aspects of business development, customer engagement, or entrepreneurial challenges. These elements can frame discussions about building sustainable businesses and creating customer value."
    ];

    // Return a random analysis template
    const randomIndex = Math.floor(Math.random() * analysisTemplates.length);
    return analysisTemplates[randomIndex];
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image: " + (error as Error).message);
  }
}
