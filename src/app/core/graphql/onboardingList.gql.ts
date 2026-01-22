import gql from "graphql-tag";

export const GET_NEW_ONBOARDING_LEADS = gql`
  query {
    onboardingNewLeads {
      id
      name
      mobile
      source
      status
    }
  }
`;

export const GET_COMPLETED_ONBOARDING_LEADS = gql`
  query {
    onboardingCompletedLeads {
      id
      name
      mobile
      source
      status
    }
  }
`;
