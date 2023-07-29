import { extractTeamMemberInformation } from "~/lc/team"
// earlybird.com should be categorized as fake

test("should handle empty content", async () => {
  const contentWithNothing = `
  We use cookies and Google Analytics to improve your browsing experience on our site and to understand where our audience is coming from. To find out more, please read our [Privacy Policy](/imprint/#privacypolicy "Privacy Policy"). By choosing I Accept, you consent to our use of cookies and Google Analytics.

  I accept

  # [](https://earlybird.com)

  *   [Home](https://earlybird.com/)
  *   [About Us](/#about)
  *   [Portfolio](https://earlybird.com/portfolio/)
  *   [Team](https://earlybird.com/team/)
  *   [Insights](https://earlybird.com/interests/)
  *   [Vision Lab](https://earlybird.com/vision-lab/)
  *   [Jobs](https://jobs.earlybird.com)
  *   [Contact](https://earlybird.com/contact/)

  # We are Earlybird
  `

  const result = await extractTeamMemberInformation(contentWithNothing)

  // assert empty array
  expect(result).toEqual([])
})

// NODE_INSPECT_RESUME_ON_START=1 node inspect --port=0 \
// node_modules/.bin/jest --runInBand --no-cache $TEST_TIMEOUT "$@"
